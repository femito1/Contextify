from spellchecker import SpellChecker
from typing import Dict, List
from .language import detect_language

class LabelSpellChecker:
    def __init__(self):
        """Initialize spell checkers for English and Italian"""
        self.english_checker = SpellChecker(language='en')
        self.italian_checker = SpellChecker(language='it')

    def check_label(self, label: str) -> Dict[str, any]:
        """
        Check if a label is spelled correctly and suggest corrections if needed.
        Automatically detects the language of the label.
        
        Args:
            label (str): The label to check
            
        Returns:
            Dict[str, any]: Dictionary containing spelling check results
        """
        # Detect the language of the label
        language = detect_language(label)
        checker = self.english_checker if language == 'en' else self.italian_checker
        
        # Check if the label is in the dictionary
        is_correct = checker.known([label])
        
        result = {
            'is_correct': bool(is_correct),
            'label': label,
            'language': language,
            'suggestions': []
        }
        
        # If label is not correct, get suggestions
        if not is_correct:
            result['suggestions'] = list(checker.candidates(label))
        
        return result

def check_labels(labels: List[str]) -> Dict[str, any]:
    """
    Check spelling of labels, automatically detecting their language.
    
    Args:
        labels (List[str]): List of labels to check
        
    Returns:
        Dict[str, any]: Dictionary containing spelling check results
    """
    checker = LabelSpellChecker()
    results = []
    
    for label in labels:
        result = checker.check_label(label)
        results.append(result)
    
    return {
        'all_correct': all(r['is_correct'] for r in results),
        'labels': results
    } 