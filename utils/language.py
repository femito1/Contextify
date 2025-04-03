from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException
from spellchecker import SpellChecker

def detect_language(text):
    """
    Detects the language of the input text.
    Currently supports English and Italian.
    
    Args:
        text (str): The input text
        
    Returns:
        str: The detected language code ('en' or 'it')
    """
    try:
        # Use langdetect to determine the language
        detected_lang = detect(text)
        
        # For now, we're only supporting English and Italian
        if detected_lang == 'it':
            return 'it'
        else:
            return 'en'  # Default to English for any other language
    
    except LangDetectException:
        # In case of any detection errors, default to English
        return 'en' 

def spell_check_label(label, language='en'):
    """
    Check if a label is spelled correctly.
    
    Args:
        label (str): The label to check
        language (str): The language code ('en' or 'it')
        
    Returns:
        dict: A dictionary with spell check results:
            - correct (bool): Whether the spelling is correct
            - suggestion (str): Suggested correction if incorrect
    """
    # Create a spell checker for the specified language
    spell = SpellChecker(language=language)
    
    # Remove spaces from multi-word labels to check each word
    words = label.split()
    
    # Check if any word is misspelled
    misspelled = spell.unknown(words)
    
    if misspelled:
        # Get the first misspelled word and its correction
        word = list(misspelled)[0]
        correction = spell.correction(word)
        
        # Replace the misspelled word in the original label
        corrected_label = label.replace(word, correction)
        
        return {
            'correct': False,
            'original': label,
            'suggestion': corrected_label
        }
    
    return {
        'correct': True,
        'original': label
    } 