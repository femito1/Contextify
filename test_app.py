import unittest
from app import app
import json

class TestZeroShotClassificationAPI(unittest.TestCase):
    def setUp(self):
        """Set up test client and other test variables"""
        self.app = app.test_client()
        self.app.testing = True

    def test_index_endpoint(self):
        """Test the root endpoint"""
        response = self.app.get('/')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['name'], 'Zero-Shot Classification API')
        self.assertEqual(data['version'], '0.1.0')
        self.assertIn('/api/classify', data['endpoints'])
        self.assertIn('/api/health', data['endpoints'])

    def test_health_check(self):
        """Test the health check endpoint"""
        response = self.app.get('/api/health')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['version'], '0.1.0')

    def test_classify_valid_input(self):
        """Test classification with valid input"""
        test_data = {
            'text': 'This is a test sentence.',
            'labels': ['positive', 'negative', 'neutral']
        }
        
        response = self.app.post('/api/classify',
                               data=json.dumps(test_data),
                               content_type='application/json')
        
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn('results', data)
        self.assertIn('language', data)

    def test_classify_invalid_input(self):
        """Test classification with invalid input"""
        test_data = {
            'text': '',  # Empty text
            'labels': []  # Empty labels
        }
        
        response = self.app.post('/api/classify',
                               data=json.dumps(test_data),
                               content_type='application/json')
        
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('error', data)

    def test_classify_missing_fields(self):
        """Test classification with missing required fields"""
        test_data = {
            'text': 'Test sentence'  # Missing labels
        }
        
        response = self.app.post('/api/classify',
                               data=json.dumps(test_data),
                               content_type='application/json')
        
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('error', data)

    def test_classify_invalid_json(self):
        """Test classification with invalid JSON"""
        response = self.app.post('/api/classify',
                               data='invalid json',
                               content_type='application/json')
        
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 500)
        self.assertFalse(data['success'])
        self.assertIn('error', data)
        
    def test_spell_check_labels(self):
        """Test the spell checking functionality for labels"""
        test_data = {
            'text': 'This is a test sentence.',
            'labels': ['positve', 'happyness', 'neutral']  # Misspelled labels
        }
        
        response = self.app.post('/api/classify',
                              data=json.dumps(test_data),
                              content_type='application/json')
        
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('error', data)
        self.assertIn('spelling_suggestions', data)
        
        # Check if we got spelling suggestions for the misspelled words
        self.assertIn('positve', data['spelling_suggestions'])
        self.assertIn('happyness', data['spelling_suggestions'])
        
        # Check if the suggestions are correct
        self.assertEqual(data['spelling_suggestions']['positve'], 'positive')
        self.assertEqual(data['spelling_suggestions']['happyness'], 'happiness')

if __name__ == '__main__':
    unittest.main() 