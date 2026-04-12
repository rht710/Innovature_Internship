import requests
import time

BASE_URL = "http://127.0.0.1:8001"
USERNAME = "testuser"
PASSWORD = "password123"

def test_otp_lockout():
    # 1. Login to trigger OTP
    print("--- Step 1: Login ---")
    response = requests.post(f"{BASE_URL}/login/", json={"username": USERNAME, "password": PASSWORD})
    if response.status_code != 200:
        print(f"Login failed: {response.json()}")
        return
    print("OTP sent.")

    # 2. Enter wrong OTP 5 times
    print("\n--- Step 2: Entering 5 wrong OTPs ---")
    for i in range(1, 6):
        response = requests.post(f"{BASE_URL}/verify-otp/", json={"username": USERNAME, "otp": "000000"})
        print(f"Attempt {i}: {response.status_code} - {response.json().get('error')}")
    
    # 3. Check if locked
    print("\n--- Step 3: Verifying Lockout ---")
    response = requests.post(f"{BASE_URL}/verify-otp/", json={"username": USERNAME, "otp": "000000"})
    print(f"Verification Check: {response.status_code} - {response.json().get('error')}")
    
    # 4. Check if login is also locked
    print("\n--- Step 4: Login Check ---")
    response = requests.post(f"{BASE_URL}/login/", json={"username": USERNAME, "password": PASSWORD})
    print(f"Login Check: {response.status_code} - {response.json().get('error')}")

if __name__ == "__main__":
    test_otp_lockout()
