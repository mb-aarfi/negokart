#!/usr/bin/env python3
"""
Simple test script to verify authentication endpoints are working
"""
import requests
import json

# Configuration
BASE_URL = "https://negokart-backend-8pt9.onrender.com"
# For local testing, uncomment the line below:
# BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Health check status: {response.status_code}")
        print(f"Health check response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_debug_users():
    """Test debug users endpoint"""
    print("\nTesting debug users endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/debug/users", timeout=10)
        print(f"Debug users status: {response.status_code}")
        print(f"Debug users response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Debug users failed: {e}")
        return False

def test_register():
    """Test user registration"""
    print("\nTesting user registration...")
    test_user = {
        "username": "testuser123",
        "password": "testpass123",
        "role": "retailer"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/register",
            json=test_user,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Registration status: {response.status_code}")
        print(f"Registration response: {response.json()}")
        return response.status_code in [200, 400]  # 400 if user already exists
    except Exception as e:
        print(f"Registration failed: {e}")
        return False

def test_login():
    """Test user login"""
    print("\nTesting user login...")
    login_data = {
        "username": "retailer",
        "password": "retailer123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        print(f"Login status: {response.status_code}")
        print(f"Login response: {response.json()}")
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            return token
        return None
    except Exception as e:
        print(f"Login failed: {e}")
        return None

def test_authenticated_endpoint(token):
    """Test authenticated endpoint"""
    if not token:
        print("\nNo token available for authenticated test")
        return False
        
    print("\nTesting authenticated endpoint...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/test-auth",
            headers=headers,
            timeout=10
        )
        print(f"Authenticated test status: {response.status_code}")
        print(f"Authenticated test response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Authenticated test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Starting authentication tests...")
    print(f"Testing against: {BASE_URL}")
    
    # Test health
    health_ok = test_health()
    
    # Test debug users
    debug_ok = test_debug_users()
    
    # Test registration
    register_ok = test_register()
    
    # Test login
    token = test_login()
    login_ok = token is not None
    
    # Test authenticated endpoint
    auth_ok = test_authenticated_endpoint(token)
    
    print("\n" + "="*50)
    print("TEST RESULTS:")
    print(f"Health check: {'PASS' if health_ok else 'FAIL'}")
    print(f"Debug users: {'PASS' if debug_ok else 'FAIL'}")
    print(f"Registration: {'PASS' if register_ok else 'FAIL'}")
    print(f"Login: {'PASS' if login_ok else 'FAIL'}")
    print(f"Authenticated endpoint: {'PASS' if auth_ok else 'FAIL'}")
    
    if all([health_ok, debug_ok, register_ok, login_ok, auth_ok]):
        print("\n🎉 All tests passed! Authentication is working correctly.")
    else:
        print("\n❌ Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
