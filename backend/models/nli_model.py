from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from yake import KeywordExtractor
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from sentence_transformers import SentenceTransformer, util

keyword_labels = {
    'politics': {
        'name': {'en': 'Politics', 'it': 'Politica'},
        'keywords': {
            'en': ['government', 'election', 'president', 'political', 'party', 'vote', 'policy', 'minister', 'debate', 'parliament', 'democracy'],
            'it': ['governo', 'elezione', 'presidente', 'politico', 'partito', 'voto', 'politica', 'ministro', 'dibattito', 'parlamento', 'democrazia']
        }
    },
    'sports': {
        'name': {'en': 'Sports', 'it': 'Sport'},
        'keywords': {
            'en': ['football', 'soccer', 'basketball', 'game', 'player', 'team', 'score', 'match', 'tournament', 'league', 'athlete', 'coach'],
            'it': ['calcio', 'pallone', 'pallacanestro', 'partita', 'giocatore', 'squadra', 'punteggio', 'torneo', 'campionato', 'atleta', 'allenatore']
        }
    },
    'technology': {
        'name': {'en': 'Technology', 'it': 'Tecnologia'},
        'keywords': {
            'en': ['computer', 'software', 'internet', 'app', 'digital', 'tech', 'AI', 'robotics', 'blockchain', 'programming', 'device'],
            'it': ['computer', 'software', 'internet', 'app', 'digitale', 'tecnologia', 'intelligenza artificiale', 'robotica', 'blockchain', 'programmazione', 'dispositivo']
        }
    },
    'science': {
        'name': {'en': 'Science', 'it': 'Scienza'},
        'keywords': {
            'en': ['research', 'study', 'scientist', 'experiment', 'discovery', 'theory', 'physics', 'biology', 'chemistry', 'data', 'analysis'],
            'it': ['ricerca', 'studio', 'scienziato', 'esperimento', 'scoperta', 'teoria', 'fisica', 'biologia', 'chimica', 'dati', 'analisi']
        }
    },
    'entertainment': {
        'name': {'en': 'Entertainment', 'it': 'Intrattenimento'},
        'keywords': {
            'en': ['movie', 'film', 'music', 'actor', 'celebrity', 'show', 'drama', 'comedy', 'series', 'concert'],
            'it': ['film', 'musica', 'attore', 'celebrità', 'spettacolo', 'dramma', 'commedia', 'serie', 'concerto']
        }
    },
    'travel': {
        'name': {'en': 'Travel', 'it': 'Viaggio'},
        'keywords': {
            'en': ['city', 'country', 'destination', 'tourism', 'visit', 'trip', 'vacation', 'landmark', 'adventure', 'architecture'],
            'it': ['città', 'paese', 'destinazione', 'turismo', 'visita', 'viaggio', 'vacanza', 'monumento', 'avventura', 'architettura']
        }
    },
    'food': {
        'name': {'en': 'Food', 'it': 'Cibo'},
        'keywords': {
            'en': ['recipe', 'restaurant', 'cook', 'delicious', 'taste', 'flavor', 'cuisine', 'chef', 'dish', 'meal', 'ingredient'],
            'it': ['ricetta', 'ristorante', 'cuoco', 'delizioso', 'gusto', 'sapore', 'cucina', 'chef', 'piatto', 'pasto', 'ingrediente']
        }
    },
    'health': {
        'name': {'en': 'Health', 'it': 'Salute'},
        'keywords': {
            'en': ['doctor', 'medical', 'disease', 'exercise', 'healthy', 'wellness', 'treatment', 'hospital', 'vaccine', 'nutrition'],
            'it': ['medico', 'salute', 'malattia', 'esercizio', 'sano', 'benessere', 'cura', 'ospedale', 'vaccino', 'nutrizione']
        }
    },
    'business': {
        'name': {'en': 'Business', 'it': 'Business'},
        'keywords': {
            'en': ['company', 'market', 'economy', 'financial', 'investment', 'startup', 'industry', 'revenue', 'stock', 'capital'],
            'it': ['azienda', 'mercato', 'economia', 'finanziario', 'investimento', 'startup', 'industria', 'ricavo', 'azione', 'capitale']
        }
    },
    'education': {
        'name': {'en': 'Education', 'it': 'Educazione'},
        'keywords': {
            'en': ['school', 'university', 'student', 'learning', 'teacher', 'study', 'course', 'exam', 'degree', 'classroom'],
            'it': ['scuola', 'università', 'studente', 'apprendimento', 'insegnante', 'studio', 'corso', 'esame', 'laurea', 'aula']
        }
    }
}


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
def predict_labels(text, labels, lang="en"):
    premise, hypotheses = format_nli_input(text, labels, lang)

    inputs = tokenizer(
        [premise] * len(hypotheses),  # Repeat premise for each label
        hypotheses,
        padding=True,
        truncation=True,
        return_tensors="pt"
    )

    with torch.no_grad():
        outputs = model(**inputs)
    
    logits = outputs.logits  # Shape: (num_labels, 3) -> entailment, neutral, contradiction
    entailment_logits = logits[:, 0]  # Extract entailment scores

    # Convert to probabilities
    probs = F.softmax(entailment_logits, dim=0)

    return {label: prob.item() for label, prob in zip(labels, probs)}

# Extract keywords and suggest as new labels
def suggest_novel_label(text, top_n=1, lang="en"):
    kw_extractor = KeywordExtractor(lan=lang, n=1, top=top_n)
    keywords = kw_extractor.extract_keywords(text)

    return [kw[0] for kw in keywords]

embedder = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

def get_keywords_by_language(keyword_labels, lang="en"):
    return {
        label: data['keywords'].get(lang, []) 
        for label, data in keyword_labels.items()
    }

def suggest_label_by_similarity(text, keyword_labels, lang="en", top_k=1):
    label_keywords = get_keywords_by_language(keyword_labels, lang)
    text_embedding = embedder.encode(text)

    label_scores = {}
    for label, keywords in label_keywords.items():
        if not keywords:
            continue  # Skip labels with no keywords in this language
        keyword_embeddings = embedder.encode(keywords)
        label_embedding = np.mean(keyword_embeddings, axis=0)
        similarity = cosine_similarity(
            text_embedding.reshape(1, -1), label_embedding.reshape(1, -1)
        )[0][0]
        label_scores[label] = similarity

    sorted_labels = sorted(label_scores.items(), key=lambda x: x[1], reverse=True)

    # Return label names + similarity scores
    if sorted_labels:
        return sorted_labels[0][0]
    return None


# Perform the predictions
def zero_shot_classify(text, labels, lang="en", threshold = .35):
    label_probs = predict_labels(text, labels, lang)

    # Sort labels by probability
    sorted_labels = sorted(label_probs.items(), key=lambda x: x[1], reverse=True)

    # Get the best label

    best_label, best_prob = sorted_labels[0]
    if best_prob < threshold:
        novel_suggestions = suggest_label_by_similarity(text, keyword_labels=keyword_labels, lang=lang)
        return {"predicted_labels": sorted_labels, "novel_suggestions": novel_suggestions, "best_label": best_label}
    
    return {"predicted_labels": sorted_labels, "novel_suggestions": None, "best_label": best_label}