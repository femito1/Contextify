from config import MAX_TEXT_LENGTH, MAX_LABELS, MAX_LABEL_LENGTH
from utils.language import spell_check_label

def validate_classification_input(data):
    """
    Validates the input data for classification.
    
    Args:
        data (dict): The input data containing text and labels
        
    Returns:
        dict: A dictionary with validation results
    """
    # Check if data is provided
    if not data:
        return {
            'valid': False,
            'error': 'No input data provided'
        }
    
    # Check if text is provided
    if 'text' not in data or not data['text']:
        return {
            'valid': False,
            'error': 'No text provided for classification'
        }
    
    # Check text length
    if len(data['text']) > MAX_TEXT_LENGTH:
        return {
            'valid': False,
            'error': f'Text exceeds maximum length of {MAX_TEXT_LENGTH} characters'
        }
    
    # Check if labels are provided
    if 'labels' not in data or not isinstance(data['labels'], list):
        return {
            'valid': False,
            'error': 'Labels must be provided as a list'
        }
    
    # Check if at least one label is provided
    if len(data['labels']) < 1:
        return {
            'valid': False,
            'error': 'At least one label must be provided'
        }
    
    # Check if too many labels are provided
    if len(data['labels']) > MAX_LABELS:
        return {
            'valid': False,
            'error': f'Too many labels provided. Maximum is {MAX_LABELS}'
        }
    
    # Check if labels are valid strings and check spelling
    spelling_suggestions = {}
    
    for label in data['labels']:
        if not isinstance(label, str) or not label.strip():
            return {
                'valid': False,
                'error': 'All labels must be non-empty strings'
            }
        
        # Check label length - maximum 20 characters
        if len(label) > MAX_LABEL_LENGTH:
            return {
                'valid': False,
                'error': f'Label "{label}" exceeds maximum length of {MAX_LABEL_LENGTH} characters'
            }
        
        # Check label spelling
        spell_check_result = spell_check_label(label)
        if not spell_check_result['correct']:
            spelling_suggestions[label] = spell_check_result['suggestion']
    
    # If there are spelling issues, return them
    if spelling_suggestions:
        return {
            'valid': False,
            'error': 'Some labels may be misspelled',
            'spelling_suggestions': spelling_suggestions
        }
    
    # All checks passed
    return {
        'valid': True
    } 