from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from yake import KeywordExtractor
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from sentence_transformers import SentenceTransformer, util
from collections import defaultdict
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from nltk.corpus import stopwords as nltk_stopwords
import re
from sklearn.feature_extraction.text import CountVectorizer
from .keywords import keyword_labels, get_keywords_for_language

# Load fine-tuned XLM-RoBERTa model
model_name = "nharutyunyan/fine_tuned_xlmr_v2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
model.eval()


# Reformat labels to match the hypothesis format of the model
def format_nli_input(text, candidate_labels, lang="en"):
    if lang == "it":
        hypotheses = [f"Questo testo riguarda {label}" for label in candidate_labels]
    else:
        hypotheses = [f"This text is about {label}" for label in candidate_labels]

    return text, hypotheses


# Get the confidence scores for entailment
def predict_labels(text, labels, lang="en", suggested=False):
    premise, hypotheses = format_nli_input(text, labels, lang)

    inputs = tokenizer(
        [premise] * len(hypotheses),  # Repeat premise for each label
        hypotheses,
        padding=True,
        truncation=True,
        return_tensors="pt",
    )

    with torch.no_grad():
        outputs = model(**inputs)

    logits = (
        outputs.logits
    ) 
    entailment_logits = logits[:, 0]  # Extract entailment scores

    # Convert to probabilities and likelihoods
    probs = F.softmax(entailment_logits, dim=0)
    likelihoods = torch.sigmoid(entailment_logits)

    # Create results with both probability and likelihood
    results = []
    for label, prob, likelihood in zip(labels, probs, likelihoods):
        if suggested:
            results.append(
                {"label": label, "probability": 0, "likelihood": likelihood.item()}
            )
        else:
            results.append(
                {
                    "label": label,
                    "probability": prob.item(),
                    "likelihood": likelihood.item(),
                }
            )

    return results


def extract_keywords_with_frequency(text, top_n=5, lang="en"):
    text = re.sub(r"[^\w\s]", "", text.lower())
    
    if lang == "en":
        stop_words = nltk_stopwords.words('english')  
    elif lang == "it":
        stop_words = nltk_stopwords.words('italian')  
    else:
        stop_words = None
    
    vectorizer = CountVectorizer(stop_words=stop_words)
    X = vectorizer.fit_transform([text])
    word_freq = dict(zip(vectorizer.get_feature_names_out(), X.toarray()[0]))
    keywords = [(word, freq) for word, freq in word_freq.items() if len(word) > 2]
    
    keywords.sort(key=lambda x: x[1], reverse=True)
    return keywords[:top_n]


embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")


def suggest_novel_labels(text, candidate_labels, top_n=3, lang="en", min_likelihood=0):
    kw_extractor = KeywordExtractor(lan=lang, n=1, top=top_n)
    yake_keywords = [(kw[0], kw[1]) for kw in kw_extractor.extract_keywords(text)]
    frequent_words = extract_keywords_with_frequency(text, top_n=top_n, lang=lang)
    candidate_keywords = set(c.lower() for c in candidate_labels)
    suggestions = {}
    for word, score in yake_keywords + frequent_words:
        word = word.lower()
        if word not in suggestions and word not in candidate_keywords:
            suggestions[word] = score

    if suggestions:
        max_score = max(suggestions.values())
        suggestions = {word: (score / max_score) for word, score in suggestions.items()}

    top_keywords = [
        word
        for word, score in sorted(suggestions.items(), key=lambda x: x[1], reverse=True)
    ][:top_n]

    if not top_keywords:
        return []

    predictions = predict_labels(text, top_keywords, lang=lang, suggested=True)

    return [pred for pred in predictions if pred["likelihood"] >= min_likelihood]


def suggest_label_by_similarity(
    text, candidate_labels, lang="en", top_k=3, min_likelihood=0
):
    label_keywords = get_keywords_for_language(keyword_labels, lang)

    candidate_keywords = set(c.lower() for c in candidate_labels)
    available_keywords = [
        kw for kw in label_keywords if kw.lower() not in candidate_keywords
    ]

    if not available_keywords:
        return []

    text_embedding = embedder.encode(text)
    keyword_embeddings = embedder.encode(available_keywords)

    similarities = cosine_similarity(text_embedding.reshape(1, -1), keyword_embeddings)[
        0
    ]
    keyword_scores = list(zip(available_keywords, similarities))
    top_keywords = [
        kw.lower()
        for kw, score in sorted(keyword_scores, key=lambda x: x[1], reverse=True)
    ][:top_k]

    if not top_keywords:
        return []

    predictions = predict_labels(text, top_keywords, lang, suggested=True)

    return [pred for pred in predictions if pred["likelihood"] >= min_likelihood]


def zero_shot_classify(text, labels, lang="en", threshold=0.35):
    min_likelihood = 0
    sorted_predictions = []
    if labels:
        predictions = predict_labels(text, labels, lang)
        sorted_predictions = sorted(
            predictions, key=lambda x: x["probability"], reverse=True
        )
        best_label = sorted_predictions[0]
        max_candidate_likelihood = max(p["likelihood"] for p in predictions)
        min_likelihood = max_candidate_likelihood

    similar_keywords = suggest_label_by_similarity(
        text, labels, lang=lang, top_k=3, min_likelihood=min_likelihood
    )

    keyword_suggestions = suggest_novel_labels(
        text, labels, top_n=3, lang=lang, min_likelihood=min_likelihood
    )

    sorted_similar_keywords = sorted(
        similar_keywords, key=lambda x: x["likelihood"], reverse=True
    )

    sorted_keyword_suggestions = sorted(
        keyword_suggestions, key=lambda x: x["likelihood"], reverse=True
    )
    if sorted_keyword_suggestions:
        best_label = sorted_keyword_suggestions[0]
        if (
            sorted_similar_keywords
            and sorted_keyword_suggestions[0]["likelihood"]
            < sorted_similar_keywords[0]["likelihood"]
        ):
            best_label = sorted_similar_keywords[0]

    elif sorted_similar_keywords:
        best_label = sorted_similar_keywords[0]

    novel_suggestions = {
        "similar_predefined_labels": similar_keywords,
        "keyword_suggestions": keyword_suggestions,
    }
    return {
        "predictions": sorted_predictions,
        "novel_suggestions": (
            novel_suggestions if any(similar_keywords + keyword_suggestions) else None
        ),
        "best_label": best_label,
    }
