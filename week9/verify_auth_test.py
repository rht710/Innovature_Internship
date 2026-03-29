import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_auth():
    # 1. Register a new user
    reg_data = {
        "username": "testuser_unique_1",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    print("Testing Registration...")
    response = requests.post(f"{BASE_URL}/register/", json=reg_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        token = response.json().get('token')
        print(f"Success! Token received: {token}")
    else:
        print("Registration failed or user already exists.")

    # 2. Login
    login_data = {
        "username": "testuser_unique_1",
        "password": "testpassword123"
    }
    print("\nTesting Login...")
    response = requests.post(f"{BASE_URL}/login/", json=login_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        token = response.json().get('token')
        print(f"Success! Login token: {token}")
        
        # 3. Test authenticated request
        headers = {"Authorization": f"Token {token}"}
        print("\nTesting Authenticated Request (Cart)...")
        response = requests.get(f"{BASE_URL}/carts/", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    else:
        print("Login failed.")

if __name__ == "__main__":
    try:
        test_auth()
    except Exception as e:
        print(f"Error: {e}")
