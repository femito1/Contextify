from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException

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