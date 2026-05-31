import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_auth():
    # 1. Register a new user
    reg_data = {
        "username": "testuser_jwt_unique_2",
        "email": "jwt_test2@example.com",
        "password": "testpassword123"
    }
    print("Testing Registration (JWT)...")
    response = requests.post(f"{BASE_URL}/register/", json=reg_data)
    print(f"Status: {response.status_code}")
    try:
        res_json = response.json()
        print(f"Response keys: {list(res_json.keys())}")
    except Exception:
        print(f"Response text: {response.text}")
        return
    
    if response.status_code == 200:
        access_token = res_json.get('access')
        refresh_token = res_json.get('refresh')
        print(f"Success! Access Token: {access_token[:15]}... Refresh Token: {refresh_token[:15]}...")
    else:
        print("Registration failed or user already exists.")

    # 2. Login
    login_data = {
        "username": "testuser_jwt_unique_2",
        "password": "testpassword123"
    }
    print("\nTesting Login (JWT)...")
    response = requests.post(f"{BASE_URL}/login/", json=login_data)
    print(f"Status: {response.status_code}")
    res_json = response.json()
    print(f"Response keys: {list(res_json.keys())}")
    
    if response.status_code == 200:
        access_token = res_json.get('access')
        refresh_token = res_json.get('refresh')
        print(f"Success! Login Access Token: {access_token[:15]}...")
        
        # 3. Test authenticated request using Bearer
        headers = {"Authorization": f"Bearer {access_token}"}
        print("\nTesting Authenticated Request (Cart using Bearer)...")
        response = requests.get(f"{BASE_URL}/carts/", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

        # 4. Test Token Refresh
        print("\nTesting Token Refresh...")
        refresh_data = {"refresh": refresh_token}
        response = requests.post(f"{BASE_URL}/token/refresh/", json=refresh_data)
        print(f"Status: {response.status_code}")
        try:
            refresh_json = response.json()
            new_access_token = refresh_json.get('access')
            print(f"Success! New Access Token: {new_access_token[:15]}...")
            
            # Verify new access token works
            headers = {"Authorization": f"Bearer {new_access_token}"}
            print("\nTesting Authenticated Request (Cart using new Access Token)...")
            response = requests.get(f"{BASE_URL}/carts/", headers=headers)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
        except Exception as e:
            print(f"Token refresh test failed: {e}")
    else:
        print("Login failed.")

if __name__ == "__main__":
    try:
        test_auth()
    except Exception as e:
        print(f"Error: {e}")
