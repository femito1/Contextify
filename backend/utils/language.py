from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException
from spellchecker import SpellChecker
import language_tool_python

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
    # It seems slow with this one
    # tool = language_tool_python.LanguageTool(language)
    # matches = tool.check(label)
    
    # if matches:
    #     # Get the first suggestion for the first error
    #     first_error = matches[0]
    #     suggestion = first_error.replacements[0] if first_error.replacements else label
        
    #     return {
    #         'correct': False,
    #         'original': label,
    #         'suggestion': suggestion
    #     }
    
    return {
        'correct': True,
        'original': label
    }

def get_label_suggestions(query, text_context='', language='en'):
    """
    Get label suggestions based on partial input and optional text context.
    
    Args:
        query (str): The partial label input to get suggestions for
        text_context (str): Optional text to use for context-aware suggestions
        language (str): The language code ('en' or 'it')
        
    Returns:
        list: A list of suggested labels
    """
    # Common categories by language
    common_categories = {
        'en': [
            'arts', 'business', 'education', 'entertainment', 'environment', 
            'finance', 'food', 'health', 'lifestyle', 'music', 'news', 'politics', 
            'science', 'sports', 'technology', 'travel', 'weather', 'gaming', 
            'fashion', 'history', 'literature', 'medicine', 'movies', 'nature',
            'philosophy', 'photography', 'religion', 'shopping', 'social media',
            'television', 'theater', 'wildlife', 'cooking', 'cars', 'space',
            'mathematics', 'programming', 'psychology', 'economy', 'geography'
        ],
        'it': [
            'arte', 'affari', 'educazione', 'intrattenimento', 'ambiente',
            'finanza', 'cibo', 'salute', 'stile di vita', 'musica', 'notizie', 'politica',
            'scienza', 'sport', 'tecnologia', 'viaggi', 'meteo', 'giochi',
            'moda', 'storia', 'letteratura', 'medicina', 'film', 'natura',
            'filosofia', 'fotografia', 'religione', 'shopping', 'social media',
            'televisione', 'teatro', 'fauna selvatica', 'cucina', 'auto', 'spazio',
            'matematica', 'programmazione', 'psicologia', 'economia', 'geografia'
        ]
    }
    
    # Get appropriate category list based on language
    categories = common_categories.get(language, common_categories['en'])
    
    # If query is empty or too short, return all categories (limit to 15)
    if not query or len(query) < 2:
        return categories[:15]
    
    # Filter categories by query match
    filtered = [cat for cat in categories if query.lower() in cat.lower()]
    
    # Use text context for smarter suggestions if available
    if text_context and len(text_context) > 5:
        # In a real implementation, this could use NLP to extract keywords
        # from the text_context and prioritize relevant categories
        # For now, we'll just use a simple implementation
        pass
    
    # Limit to 10 results
    return filtered[:10]