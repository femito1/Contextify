import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Flask configuration
DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
PORT = int(os.environ.get('PORT', 5000))

# Model settings
MODEL_THRESHOLD = float(os.environ.get('MODEL_THRESHOLD', 0.3))

# API settings
MAX_TEXT_LENGTH = int(os.environ.get('MAX_TEXT_LENGTH', 5000))
MAX_LABELS = int(os.environ.get('MAX_LABELS', 10))
MAX_LABEL_LENGTH = int(os.environ.get('MAX_LABEL_LENGTH', 20)) 