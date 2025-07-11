import cv2
import os
import numpy as np
from PIL import Image
import base64
import io
from bson import ObjectId
from app.models.user_model import User
from app.utils.db_connection import db_instance


class FaceRecognitionService:
    def __init__(self):
        # Initialize face cascade classifier
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        # Initialize LBPH recognizer
        self.recognizer = cv2.face.LBPHFaceRecognizer_create()
        
        # Paths for storing face data
        self.dataset_path = "face_dataset"
        self.trainer_path = "face_trainer.yml"
        
        # Ensure dataset directory exists
        os.makedirs(self.dataset_path, exist_ok=True)
    
    def decode_base64_image(self, base64_string):
        """Decode base64 image string to numpy array"""
        try:
            # Remove the data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode base64 to bytes
            image_bytes = base64.b64decode(base64_string)
            
            # Convert to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            img_array = np.array(image)
            
            # Convert RGB to BGR for OpenCV
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            
            return img_array
        except Exception as e:
            raise ValueError(f"Failed to decode image: {str(e)}")
    
    def detect_face(self, image):
        """Detect face in image and return face region"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            raise ValueError("No face detected in the image")
        elif len(faces) > 1:
            raise ValueError("Multiple faces detected. Please ensure only one face is visible")
        
        # Return the face region
        x, y, w, h = faces[0]
        face_img = gray[y:y+h, x:x+w]
        return face_img
    
    def get_next_face_id(self):
        """Get the next available face ID"""
        # Get all existing face IDs from users collection
        users_collection = User.get_collection()
        existing_face_ids = users_collection.distinct("face_id", {"face_id": {"$exists": True, "$ne": None}})
        
        # Find the next available ID
        face_id = 1
        while face_id in existing_face_ids:
            face_id += 1
        
        return face_id
    
    def register_face_samples(self, user_id, base64_images):
        """Register face samples for a user"""
        if len(base64_images) < 3:
            raise ValueError("Minimum 3 images required for face registration")
        
        if len(base64_images) > 30:
            raise ValueError("Maximum 30 images allowed for face registration")
        
        # Get or assign face ID
        user = User.find_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        face_id = user.get('face_id')
        if not face_id:
            face_id = self.get_next_face_id()
        
        # Create user directory
        user_dir = os.path.join(self.dataset_path, f"user_{face_id}")
        os.makedirs(user_dir, exist_ok=True)
        
        # Clear existing samples for this user
        for filename in os.listdir(user_dir):
            if filename.endswith('.jpg'):
                os.remove(os.path.join(user_dir, filename))
        
        results = []
        saved_count = 0
        
        # Process each image
        for idx, base64_image in enumerate(base64_images, 1):
            try:
                # Decode image
                image = self.decode_base64_image(base64_image)
                
                # Detect and extract face
                face_img = self.detect_face(image)
                
                # Save face sample
                filename = f"{idx}.jpg"
                filepath = os.path.join(user_dir, filename)
                cv2.imwrite(filepath, face_img)
                
                saved_count += 1
                results.append({
                    "sample": idx,
                    "success": True,
                    "message": f"Face sample {idx} saved successfully"
                })
                
            except Exception as e:
                results.append({
                    "sample": idx,
                    "success": False,
                    "message": f"Failed to process sample {idx}: {str(e)}"
                })
        
        if saved_count < 3:
            # Clean up if we don't have enough valid samples
            for filename in os.listdir(user_dir):
                if filename.endswith('.jpg'):
                    os.remove(os.path.join(user_dir, filename))
            raise ValueError(f"Only {saved_count} valid face samples found. Minimum 3 required.")
        
        # Update user with face_id
        User.update_user(user_id, {"face_id": face_id})
        
        # Train the model
        self.train_model()
        
        return {
            "face_id": face_id,
            "samples_saved": saved_count,
            "results": results
        }
    
    def train_model(self):
        """Train the face recognition model with all registered faces"""
        def get_images_and_labels(path):
            image_paths = []
            for user_folder in os.listdir(path):
                full_path = os.path.join(path, user_folder)
                if os.path.isdir(full_path) and user_folder.startswith('user_'):
                    for f in os.listdir(full_path):
                        if f.endswith('.jpg'):
                            image_paths.append(os.path.join(full_path, f))
            
            face_samples = []
            ids = []
            
            for image_path in image_paths:
                try:
                    img = Image.open(image_path).convert('L')
                    img_np = np.array(img, 'uint8')
                    face_id = int(os.path.basename(os.path.dirname(image_path)).split('_')[1])
                    
                    # The image is already a face region, so we can use it directly
                    face_samples.append(img_np)
                    ids.append(face_id)
                except Exception as e:
                    print(f"Error processing {image_path}: {e}")
                    continue
            
            return face_samples, ids
        
        try:
            faces, ids = get_images_and_labels(self.dataset_path)
            
            if len(faces) == 0:
                raise ValueError("No face samples found for training")
            
            # Train the recognizer
            self.recognizer.train(faces, np.array(ids))
            self.recognizer.save(self.trainer_path)
            
            print(f"Model training completed. Trained on {len(faces)} samples.")
            return True
            
        except Exception as e:
            raise ValueError(f"Model training failed: {str(e)}")
    
    def recognize_face(self, base64_image):
        """Recognize a face from base64 image"""
        if not os.path.exists(self.trainer_path):
            raise ValueError("No trained model found. Please register faces first.")
        
        try:
            # Load the trained model
            self.recognizer.read(self.trainer_path)
            
            # Decode and process image
            image = self.decode_base64_image(base64_image)
            face_img = self.detect_face(image)
            
            # Perform recognition
            face_id, confidence = self.recognizer.predict(face_img)
            
            # Calculate accuracy (lower confidence means higher accuracy)
            accuracy = max(0, 100 - confidence)
            
            if confidence < 70:  # Recognition threshold
                # Find user by face_id
                users_collection = User.get_collection()
                user = users_collection.find_one({"face_id": face_id})
                
                if user:
                    # Remove sensitive data
                    user_data = {
                        "id": str(user["_id"]),
                        "firstName": user.get("firstName", ""),
                        "lastName": user.get("lastName", ""),
                        "email": user.get("email", "")
                    }
                    
                    return {
                        "recognized": True,
                        "user": user_data,
                        "confidence": float(confidence),
                        "accuracy": float(accuracy)
                    }
            
            return {
                "recognized": False,
                "confidence": float(confidence),
                "accuracy": float(accuracy)
            }
            
        except Exception as e:
            raise ValueError(f"Face recognition failed: {str(e)}")
    
    def delete_user_face_data(self, user_id):
        """Delete all face data for a user"""
        user = User.find_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        face_id = user.get('face_id')
        if face_id:
            # Delete user's face samples
            user_dir = os.path.join(self.dataset_path, f"user_{face_id}")
            if os.path.exists(user_dir):
                for filename in os.listdir(user_dir):
                    os.remove(os.path.join(user_dir, filename))
                os.rmdir(user_dir)
            
            # Remove face_id from user record
            User.update_user(user_id, {"$unset": {"face_id": ""}})
            
            # Retrain model with remaining faces
            try:
                if self.has_registered_faces():
                    self.train_model()
                else:
                    # Remove trainer file if no faces left
                    if os.path.exists(self.trainer_path):
                        os.remove(self.trainer_path)
            except Exception as e:
                print(f"Warning: Failed to retrain model after deletion: {e}")
        
        return True
    
    def has_registered_faces(self):
        """Check if there are any registered faces"""
        if not os.path.exists(self.dataset_path):
            return False
        
        for item in os.listdir(self.dataset_path):
            item_path = os.path.join(self.dataset_path, item)
            if os.path.isdir(item_path) and item.startswith('user_'):
                if any(f.endswith('.jpg') for f in os.listdir(item_path)):
                    return True
        return False
    
    def user_has_face_registered(self, user_id):
        """Check if a user has registered face samples"""
        user = User.find_by_id(user_id)
        if not user:
            return False
        
        face_id = user.get('face_id')
        if not face_id:
            return False
        
        user_dir = os.path.join(self.dataset_path, f"user_{face_id}")
        if not os.path.exists(user_dir):
            return False
        
        # Check if there are any face samples
        return any(f.endswith('.jpg') for f in os.listdir(user_dir))