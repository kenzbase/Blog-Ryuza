#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for HoverBoard Blog Ryuza Application
Tests all authentication, user management, and project management endpoints
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class HoverBoardAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.test_user_id = None
        self.test_project_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status} - {name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({
            'name': name,
            'success': success,
            'details': details
        })
        return success

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, use_auth: bool = False) -> tuple[bool, Dict]:
        """Make HTTP request and validate response"""
        url = f"{self.api_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            if not success:
                response_data["status_code"] = response.status_code
                response_data["expected_status"] = expected_status

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, data = self.make_request('GET', '/')
        return self.log_test(
            "Root API Endpoint", 
            success and "message" in data,
            f"Response: {data.get('message', 'No message')}"
        )

    def test_get_projects_public(self):
        """Test getting all projects (public endpoint)"""
        success, data = self.make_request('GET', '/projects')
        projects_count = len(data) if isinstance(data, list) else 0
        return self.log_test(
            "Get All Projects (Public)", 
            success and isinstance(data, list),
            f"Found {projects_count} projects"
        )

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_data = {
            "email": f"test_user_{timestamp}@hoverboard.com",
            "password": "TestPass123!",
            "full_name": f"Test User {timestamp}"
        }
        
        success, data = self.make_request('POST', '/auth/register', test_data, 200)
        
        if success and "access_token" in data:
            self.token = data["access_token"]
            self.test_user_id = data.get("user", {}).get("id")
            
        return self.log_test(
            "User Registration", 
            success and "access_token" in data,
            f"Token received: {'Yes' if self.token else 'No'}"
        )

    def test_username_selection(self):
        """Test username selection after registration"""
        if not self.token:
            return self.log_test("Username Selection", False, "No auth token available")
            
        timestamp = datetime.now().strftime("%H%M%S")
        username_data = {"username": f"testuser_{timestamp}"}
        
        success, data = self.make_request('POST', '/auth/select-username', username_data, 200, True)
        return self.log_test(
            "Username Selection", 
            success and "user" in data,
            f"Username set: {username_data['username']}"
        )

    def test_demo_login(self):
        """Test login with demo credentials"""
        demo_data = {
            "email": "demo@hoverboard.com",
            "password": "demo123"
        }
        
        success, data = self.make_request('POST', '/auth/login', demo_data, 200)
        
        demo_token = None
        if success and "access_token" in data:
            demo_token = data["access_token"]
            
        return self.log_test(
            "Demo User Login", 
            success and demo_token is not None,
            f"Demo user: {data.get('user', {}).get('username', 'Unknown')}"
        )

    def test_get_current_user(self):
        """Test getting current user profile"""
        if not self.token:
            return self.log_test("Get Current User", False, "No auth token available")
            
        success, data = self.make_request('GET', '/auth/me', use_auth=True)
        return self.log_test(
            "Get Current User Profile", 
            success and "email" in data,
            f"User: {data.get('full_name', 'Unknown')}"
        )

    def test_create_project(self):
        """Test creating a new project"""
        if not self.token:
            return self.log_test("Create Project", False, "No auth token available")
            
        project_data = {
            "title": "Test Project",
            "subtitle": "Automated Test",
            "description": "This is a test project created by automated testing",
            "detailed_description": "Detailed description of the test project for comprehensive testing",
            "category": "web",
            "image_url": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
            "hover_content": "Test hover content with technical details",
            "fun_fact": "This project was created by an automated test!",
            "tech_stack": ["Python", "FastAPI", "MongoDB", "React"],
            "features": ["Automated testing", "API validation"],
            "challenges": ["Testing edge cases"],
            "solutions": ["Comprehensive test suite"],
            "duration": "1 hour",
            "team_size": 1,
            "status": "completed"
        }
        
        success, data = self.make_request('POST', '/projects', project_data, 200, True)
        
        if success and "id" in data:
            self.test_project_id = data["id"]
            
        return self.log_test(
            "Create Project", 
            success and "id" in data,
            f"Project ID: {self.test_project_id}"
        )

    def test_get_project_detail(self):
        """Test getting specific project details"""
        if not self.test_project_id:
            return self.log_test("Get Project Detail", False, "No test project ID available")
            
        success, data = self.make_request('GET', f'/projects/{self.test_project_id}')
        return self.log_test(
            "Get Project Detail", 
            success and data.get("id") == self.test_project_id,
            f"Views: {data.get('views', 0)}"
        )

    def test_update_project(self):
        """Test updating a project"""
        if not self.token or not self.test_project_id:
            return self.log_test("Update Project", False, "Missing auth token or project ID")
            
        update_data = {
            "title": "Updated Test Project",
            "subtitle": "Updated Automated Test",
            "description": "This project has been updated by automated testing",
            "detailed_description": "Updated detailed description",
            "category": "web",
            "image_url": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
            "hover_content": "Updated hover content",
            "fun_fact": "This project was updated by an automated test!",
            "tech_stack": ["Python", "FastAPI", "MongoDB", "React", "Testing"],
            "features": ["Automated testing", "API validation", "Update functionality"],
            "challenges": ["Testing edge cases", "Update validation"],
            "solutions": ["Comprehensive test suite", "Proper error handling"],
            "duration": "2 hours",
            "team_size": 1,
            "status": "completed"
        }
        
        success, data = self.make_request('PUT', f'/projects/{self.test_project_id}', update_data, 200, True)
        return self.log_test(
            "Update Project", 
            success and data.get("title") == "Updated Test Project",
            f"Updated title: {data.get('title', 'Unknown')}"
        )

    def test_get_user_by_username(self):
        """Test getting user profile by username"""
        success, data = self.make_request('GET', '/users/demo_user')
        return self.log_test(
            "Get User by Username", 
            success and data.get("username") == "demo_user",
            f"User: {data.get('full_name', 'Unknown')}"
        )

    def test_get_user_projects(self):
        """Test getting projects by username"""
        success, data = self.make_request('GET', '/users/demo_user/projects')
        projects_count = len(data) if isinstance(data, list) else 0
        return self.log_test(
            "Get User Projects", 
            success and isinstance(data, list),
            f"Demo user has {projects_count} projects"
        )

    def test_legacy_endpoints(self):
        """Test legacy hover-items endpoints"""
        success1, data1 = self.make_request('GET', '/hover-items')
        projects_count = len(data1) if isinstance(data1, list) else 0
        
        result1 = self.log_test(
            "Legacy Get Hover Items", 
            success1 and isinstance(data1, list),
            f"Found {projects_count} items via legacy endpoint"
        )
        
        # Test legacy single item endpoint if we have projects
        if projects_count > 0 and isinstance(data1, list):
            first_item_id = data1[0].get("id")
            if first_item_id:
                success2, data2 = self.make_request('GET', f'/hover-items/{first_item_id}')
                result2 = self.log_test(
                    "Legacy Get Single Hover Item", 
                    success2 and data2.get("id") == first_item_id,
                    f"Item title: {data2.get('title', 'Unknown')}"
                )
                return result1 and result2
        
        return result1

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        # Test invalid project ID
        success1, data1 = self.make_request('GET', '/projects/invalid-id', expected_status=404)
        result1 = self.log_test(
            "Error Handling - Invalid Project ID", 
            success1,
            "404 error returned correctly"
        )
        
        # Test invalid user
        success2, data2 = self.make_request('GET', '/users/nonexistent_user', expected_status=404)
        result2 = self.log_test(
            "Error Handling - Invalid Username", 
            success2,
            "404 error returned correctly"
        )
        
        # Test unauthorized access
        success3, data3 = self.make_request('GET', '/auth/me', expected_status=401)
        result3 = self.log_test(
            "Error Handling - Unauthorized Access", 
            success3,
            "401 error returned correctly"
        )
        
        return result1 and result2 and result3

    def cleanup_test_data(self):
        """Clean up test data"""
        if self.token and self.test_project_id:
            success, data = self.make_request('DELETE', f'/projects/{self.test_project_id}', use_auth=True)
            self.log_test(
                "Cleanup - Delete Test Project", 
                success,
                f"Project deleted: {success}"
            )

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting HoverBoard Backend API Tests")
        print("=" * 60)
        
        # Basic connectivity tests
        self.test_root_endpoint()
        self.test_get_projects_public()
        
        # Authentication tests
        self.test_demo_login()
        self.test_user_registration()
        self.test_username_selection()
        self.test_get_current_user()
        
        # Project management tests
        self.test_create_project()
        self.test_get_project_detail()
        self.test_update_project()
        
        # User profile tests
        self.test_get_user_by_username()
        self.test_get_user_projects()
        
        # Legacy endpoint tests
        self.test_legacy_endpoints()
        
        # Error handling tests
        self.test_error_handling()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed.")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['name']}: {result['details']}")
            return 1

def main():
    """Main test execution"""
    print("HoverBoard Backend API Tester")
    print("Testing backend at: http://localhost:8001")
    
    tester = HoverBoardAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())