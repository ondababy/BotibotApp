import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'ondababythebest')
    MONGO_URI = os.getenv('MONGO_URI')
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION', '12').replace('H', '')) 
    
class DevelopmentConfig(Config):
    DEBUG = True
    
class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}