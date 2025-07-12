#!/usr/bin/env python3
"""
Simple test script to verify the schedule system is working correctly.
"""

import requests
import json
from datetime import datetime, date

# Configuration
BASE_URL = "http://localhost:5000/api"
TEST_USER = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123"
}

class ScheduleSystemTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.schedule_id = None
        
    def test_auth(self):
        """Test user registration and login"""
        print("🔐 Testing Authentication...")
        
        try:
            # Try to register (might fail if user exists)
            register_response = requests.post(f"{self.base_url}/register", json=TEST_USER)
            print(f"Register response: {register_response.status_code}")
            
            # Login
            login_response = requests.post(f"{self.base_url}/login", json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            })
            
            if login_response.status_code == 200:
                self.token = login_response.json().get("token")
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Login failed: {login_response.text}")
                return False
                
        except requests.exceptions.ConnectionError:
            print("❌ Server not running. Please start the server first.")
            return False
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def test_create_schedule(self):
        """Test creating a medication schedule"""
        print("\n📅 Testing Schedule Creation...")
        
        if not self.token:
            print("❌ No authentication token")
            return False
            
        schedule_data = {
            "medication_name": "Test Medication",
            "dosage": "10mg",
            "frequency": "daily",
            "times": ["08:00", "20:00"],
            "start_date": date.today().strftime('%Y-%m-%d'),
            "notes": "Test schedule created by automated test",
            "reminder_enabled": True
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            response = requests.post(f"{self.base_url}/schedule", 
                                   json=schedule_data, 
                                   headers=headers)
            
            if response.status_code == 201:
                result = response.json()
                self.schedule_id = result["schedule"]["_id"]
                print("✅ Schedule created successfully")
                return True
            else:
                print(f"❌ Schedule creation failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Schedule creation error: {e}")
            return False
    
    def test_get_schedules(self):
        """Test retrieving schedules"""
        print("\n📋 Testing Schedule Retrieval...")
        
        if not self.token:
            print("❌ No authentication token")
            return False
            
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            # Get all schedules
            response = requests.get(f"{self.base_url}/schedule", headers=headers)
            
            if response.status_code == 200:
                schedules = response.json()["schedules"]
                print(f"✅ Retrieved {len(schedules)} schedules")
                
                # Get today's schedules
                today_response = requests.get(f"{self.base_url}/schedule/today", headers=headers)
                
                if today_response.status_code == 200:
                    today_schedules = today_response.json()["schedules"]
                    print(f"✅ Retrieved {len(today_schedules)} schedules for today")
                    return True
                else:
                    print(f"❌ Failed to get today's schedules: {today_response.text}")
                    return False
            else:
                print(f"❌ Failed to get schedules: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Schedule retrieval error: {e}")
            return False
    
    def test_log_medication(self):
        """Test logging medication"""
        print("\n💊 Testing Medication Logging...")
        
        if not self.token or not self.schedule_id:
            print("❌ No authentication token or schedule ID")
            return False
            
        headers = {"Authorization": f"Bearer {self.token}"}
        
        log_data = {
            "schedule_id": self.schedule_id,
            "status": "taken",
            "taken_at": datetime.now().isoformat(),
            "notes": "Test medication log"
        }
        
        try:
            response = requests.post(f"{self.base_url}/medication/log", 
                                   json=log_data, 
                                   headers=headers)
            
            if response.status_code == 201:
                print("✅ Medication logged successfully")
                
                # Get medication logs
                logs_response = requests.get(f"{self.base_url}/medication/logs", headers=headers)
                
                if logs_response.status_code == 200:
                    logs = logs_response.json()["logs"]
                    print(f"✅ Retrieved {len(logs)} medication logs")
                    return True
                else:
                    print(f"❌ Failed to get logs: {logs_response.text}")
                    return False
            else:
                print(f"❌ Medication logging failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Medication logging error: {e}")
            return False
    
    def test_update_schedule(self):
        """Test updating a schedule"""
        print("\n✏️ Testing Schedule Update...")
        
        if not self.token or not self.schedule_id:
            print("❌ No authentication token or schedule ID")
            return False
            
        headers = {"Authorization": f"Bearer {self.token}"}
        
        update_data = {
            "dosage": "15mg",
            "notes": "Updated test schedule"
        }
        
        try:
            response = requests.put(f"{self.base_url}/schedule/{self.schedule_id}", 
                                  json=update_data, 
                                  headers=headers)
            
            if response.status_code == 200:
                print("✅ Schedule updated successfully")
                return True
            else:
                print(f"❌ Schedule update failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Schedule update error: {e}")
            return False
    
    def test_delete_schedule(self):
        """Test deleting a schedule"""
        print("\n🗑️ Testing Schedule Deletion...")
        
        if not self.token or not self.schedule_id:
            print("❌ No authentication token or schedule ID")
            return False
            
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            response = requests.delete(f"{self.base_url}/schedule/{self.schedule_id}", 
                                     headers=headers)
            
            if response.status_code == 200:
                print("✅ Schedule deleted successfully")
                return True
            else:
                print(f"❌ Schedule deletion failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Schedule deletion error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("🧪 Starting Schedule System Tests")
        print("=" * 50)
        
        tests = [
            self.test_auth,
            self.test_create_schedule,
            self.test_get_schedules,
            self.test_log_medication,
            self.test_update_schedule,
            self.test_delete_schedule
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            if test():
                passed += 1
            else:
                failed += 1
        
        print("\n" + "=" * 50)
        print(f"🧪 Test Results: {passed} passed, {failed} failed")
        
        if failed == 0:
            print("🎉 All tests passed! Schedule system is working correctly.")
        else:
            print("⚠️ Some tests failed. Please check the server implementation.")

if __name__ == "__main__":
    tester = ScheduleSystemTester()
    tester.run_all_tests()
