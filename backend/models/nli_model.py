from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from yake import KeywordExtractor

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

# Perform the predictions
def zero_shot_classify(text, labels, lang="en", threshold = .35):
    label_probs = predict_labels(text, labels, lang)

    # Sort labels by probability
    sorted_labels = sorted(label_probs.items(), key=lambda x: x[1], reverse=True)

    # Get the best label

    best_label, best_prob = sorted_labels[0]
    if best_prob < threshold:
        novel_suggestions = suggest_novel_label(text, lang=lang)
        return {"predicted_labels": sorted_labels, "novel_suggestions": novel_suggestions, "best_label": best_label}
    
    return {"predicted_labels": sorted_labels, "novel_suggestions": None, "best_label": best_label}