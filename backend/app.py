from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from utils.validation import validate_classification_input
from utils.language import detect_language, get_label_suggestions
from models.classifier import predict_labels, suggest_new_label

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# for testing purposes
@app.route('/', methods=['GET'])
def index():
    """Root endpoint that provides basic API information"""
    return jsonify({
        'name': 'Zero-Shot Classification API',
        'version': '0.1.0',
        'endpoints': {
            '/api/classify': 'POST - Classify text with given labels',
            '/api/health': 'GET - Check API health status',
            '/api/suggest-labels': 'GET - Get label suggestions'
        }
    })

@app.route('/api/classify', methods=['POST'])
def home():
    try:
        # Get input text and candidate labels from request
        data = request.get_json()
        
        # Validate input data
        validation_result = validate_classification_input(data)
        if not validation_result['valid']:
            response = {
                'success': False, 
                'error': validation_result['error']
            }
            
            # Include spelling suggestions if available
            if 'spelling_suggestions' in validation_result:
                response['spelling_suggestions'] = validation_result['spelling_suggestions']
                
            return jsonify(response), 400
        
        # Extract validated data
        text = data.get('text', '')
        candidate_labels = data.get('labels', [])
        
        # Detect language (for multilingual support)
        language = detect_language(text)
        
        # This will eventually call model

        classification_results = predict_labels(text, candidate_labels, language)
        
        # Check if any label has a high enough probability
        # If not, suggest a new label
        best_label = max(classification_results, key=classification_results.get)
        if classification_results[best_label] < 0.3:  # Threshold can be adjusted
            suggested_label = suggest_new_label(text, language)
            classification_results['suggested_label'] = suggested_label
            classification_results['suggested_probability'] = 0.95  # Mock value
        
        return jsonify({
            'success': True,
            'results': classification_results,
            'language': language
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"An error occurred: {str(e)}"
        }), 500

@app.route('/api/suggest-labels', methods=['GET'])
def suggest_labels():
    """
    Get label suggestions based on partial input or context
    
    Query parameters:
    - query: The partial label string to get suggestions for
    - text: Optional text context to generate more relevant suggestions
    """
    try:
        query = request.args.get('query', '')
        text_context = request.args.get('text', '')
        
        # Get language if text context is provided
        language = 'en'
        if text_context:
            language = detect_language(text_context)
            
        # Get label suggestions
        suggestions = get_label_suggestions(query, text_context, language)
        
        return jsonify({
            'success': True,
            'suggestions': suggestions
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"An error occurred: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify the API is running"""
    return jsonify({
        'status': 'healthy',
        'version': '0.1.0'
    })

if __name__ == '__main__':
    # Use environment variables with defaults for configuration
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    app.run(host='0.0.0.0', port=port, debug=debug)