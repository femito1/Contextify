keyword_labels = {
    'politics': {
        'name': {'en': 'Politics', 'it': 'Politica'},
        'keywords': {
            'en': ['government', 'election', 'president', 'political', 'party', 'vote', 'policy', 'minister', 'debate', 'parliament', 'democracy'],
            'it': ['governo', 'elezione', 'presidente', 'politico', 'partito', 'voto', 'politica', 'ministro', 'dibattito', 'parlamento', 'democrazia']
        }
    },
    'sports': {
        'name': {'en': 'Sports', 'it': 'Sport'},
        'keywords': {
            'en': ['football', 'soccer', 'basketball', 'game', 'player', 'team', 'score', 'match', 'tournament', 'league', 'athlete', 'coach'],
            'it': ['calcio', 'pallone', 'pallacanestro', 'partita', 'giocatore', 'squadra', 'punteggio', 'torneo', 'campionato', 'atleta', 'allenatore']
        }
    },
    'technology': {
        'name': {'en': 'Technology', 'it': 'Tecnologia'},
        'keywords': {
            'en': ['computer', 'software', 'internet', 'app', 'digital', 'tech', 'AI', 'robotics', 'blockchain', 'programming', 'device'],
            'it': ['computer', 'software', 'internet', 'app', 'digitale', 'tecnologia', 'intelligenza artificiale', 'robotica', 'blockchain', 'programmazione', 'dispositivo']
        }
    },
    'science': {
        'name': {'en': 'Science', 'it': 'Scienza'},
        'keywords': {
            'en': ['research', 'study', 'scientist', 'experiment', 'discovery', 'theory', 'physics', 'biology', 'chemistry', 'data', 'analysis'],
            'it': ['ricerca', 'studio', 'scienziato', 'esperimento', 'scoperta', 'teoria', 'fisica', 'biologia', 'chimica', 'dati', 'analisi']
        }
    },
    'entertainment': {
        'name': {'en': 'Entertainment', 'it': 'Intrattenimento'},
        'keywords': {
            'en': ['movie', 'film', 'music', 'actor', 'celebrity', 'show', 'drama', 'comedy', 'series', 'concert'],
            'it': ['film', 'musica', 'attore', 'celebrità', 'spettacolo', 'dramma', 'commedia', 'serie', 'concerto']
        }
    },
    'travel': {
        'name': {'en': 'Travel', 'it': 'Viaggio'},
        'keywords': {
            'en': ['city', 'country', 'destination', 'tourism', 'visit', 'trip', 'vacation', 'landmark', 'adventure', 'architecture'],
            'it': ['città', 'paese', 'destinazione', 'turismo', 'visita', 'viaggio', 'vacanza', 'monumento', 'avventura', 'architettura']
        }
    },
    'food': {
        'name': {'en': 'Food', 'it': 'Cibo'},
        'keywords': {
            'en': ['recipe', 'restaurant', 'cook', 'delicious', 'taste', 'flavor', 'cuisine', 'chef', 'dish', 'meal', 'ingredient'],
            'it': ['ricetta', 'ristorante', 'cuoco', 'delizioso', 'gusto', 'sapore', 'cucina', 'chef', 'piatto', 'pasto', 'ingrediente']
        }
    },
    'health': {
        'name': {'en': 'Health', 'it': 'Salute'},
        'keywords': {
            'en': ['doctor', 'medical', 'disease', 'exercise', 'healthy', 'wellness', 'treatment', 'hospital', 'vaccine', 'nutrition'],
            'it': ['medico', 'salute', 'malattia', 'esercizio', 'sano', 'benessere', 'cura', 'ospedale', 'vaccino', 'nutrizione']
        }
    },
    'business': {
        'name': {'en': 'Business', 'it': 'Business'},
        'keywords': {
            'en': ['company', 'market', 'economy', 'financial', 'investment', 'startup', 'industry', 'revenue', 'stock', 'capital'],
            'it': ['azienda', 'mercato', 'economia', 'finanziario', 'investimento', 'startup', 'industria', 'ricavo', 'azione', 'capitale']
        }
    },
    'education': {
        'name': {'en': 'Education', 'it': 'Educazione'},
        'keywords': {
            'en': ['school', 'university', 'student', 'learning', 'teacher', 'study', 'course', 'exam', 'degree', 'classroom'],
            'it': ['scuola', 'università', 'studente', 'apprendimento', 'insegnante', 'studio', 'corso', 'esame', 'laurea', 'aula']
        }
    }
}

def get_keywords_for_language(keyword_labels, lang="en"):
    """Get all keywords for a specific language"""
    keywords = []
    for category in keyword_labels.values():
        keywords.extend(category['keywords'].get(lang, []))
    return list(set(keywords))
