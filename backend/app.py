from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from config import DEBUG, PORT, MODEL_THRESHOLD  
from utils.validation import validate_classification_input
from utils.language import detect_language
from models.classifier import predict_labels, suggest_new_label

def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.route('/', methods=['GET'])
    def index():
        """Root endpoint that provides basic API information"""
        return jsonify({
            'name': 'Zero-Shot Classification API',
            'version': '0.1.0',
            'endpoints': {
                '/api/classify': 'POST - Classify text with given labels',
                '/api/health': 'GET - Check API health status'
            }
        })

    @app.route('/api/classify', methods=['POST'])
    def classify_text():
        try:
            data = request.get_json()
            
            validation_result = validate_classification_input(data)
            if not validation_result['valid']:
                return jsonify({
                    'success': False, 
                    'error': validation_result['error']
                }), 400
            
            text = data.get('text', '')
            candidate_labels = data.get('labels', [])
            language = detect_language(text)
            
            classification_results = predict_labels(text, candidate_labels, language)
            
            best_label = max(classification_results, key=classification_results.get)
            if classification_results[best_label] < MODEL_THRESHOLD:
                suggested_label = suggest_new_label(text, language)
                classification_results['suggested_label'] = suggested_label
                classification_results['suggested_probability'] = 0.95
            
            return jsonify({
                'success': True,
                'results': classification_results,
                'language': language,
                'threshold': MODEL_THRESHOLD
            })
        
        except Exception as e:
            app.logger.error(f"Classification error: {str(e)}")
            return jsonify({
                'success': False,
                'error': "Internal server error"
            }), 500

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'version': '0.1.0',
            'debug': DEBUG
        })

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG) 