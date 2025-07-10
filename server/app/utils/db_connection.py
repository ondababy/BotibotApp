from pymongo import MongoClient
from config import Config
import os

class Database:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance
    
    def connect(self):
        if self._client is None:
            try:
                self._client = MongoClient(Config.MONGO_URI)
                self._db = self._client.get_default_database()
                self._client.admin.command('ping')
                print("✅ Connected to MongoDB Atlas!")
            except Exception as e:
                print(f"❌ Failed to connect to MongoDB: {e}")
                raise e
        return self._db
    
    def get_db(self):
        if self._db is None:
            return self.connect()
        return self._db
    
    def close_connection(self):
        if self._client:
            self._client.close()
            self._client = None
            self._db = None

db_instance = Database()