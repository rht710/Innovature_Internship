import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'notes_project.settings')
django.setup()

import requests
import time
import sqlite3
import datetime

BASE_URL = 'http://127.0.0.1:8000'

def setup_db():
    conn = sqlite3.connect('db.sqlite3')
    c = conn.cursor()
    
    # Simple setup via API would be better, but we can't create users via API easily without registration endpoint.
    # Actually, the users are already created in DB from the previous script runs!
    # Let's just assume they exist. But we need to reset lockout and login attempts.
    try:
        c.execute("UPDATE notes_userprofile SET failed_login_attempts=0, is_locked=0")
        conn.commit()
    except Exception as e:
        print("DB update error:", e)
    finally:
        conn.close()

def run_tests():
    print("--- Starting Verification Tests ---")
    setup_db()
    
    print("\n[1] Testing Lockout Mechanism...")
    for i in range(5):
        resp = requests.post(f'{BASE_URL}/login/', json={'username': 'normal_user', 'password': 'wrongpassword'})
        print(f"Attempt {i+1}: {resp.status_code} - {resp.json().get('error')}")
        
    # 6th attempt should be locked
    resp = requests.post(f'{BASE_URL}/login/', json={'username': 'normal_user', 'password': 'wrongpassword'})
    print(f"Attempt 6 (Lock check): {resp.status_code} - {resp.json().get('error')}")
    assert resp.status_code == 403 and "locked" in resp.json().get('error').lower()
    
    print("\n[2] Testing OTP Generation (Admin User)...")
    resp = requests.post(f'{BASE_URL}/login/', json={'username': 'admin_user', 'password': 'password123'})
    print(f"Login Response: {resp.status_code} - {resp.json()}")
    
    # We can fetch the OTP via sqlite3 since we don't have the email
    conn = sqlite3.connect('db.sqlite3')
    c = conn.cursor()
    c.execute("SELECT otp FROM notes_userprofile JOIN auth_user ON auth_user.id = notes_userprofile.user_id WHERE username='admin_user'")
    otp = c.fetchone()[0]
    conn.close()
        
    print(f"Retrieved OTP from DB: {otp}")
    
    print("\n[3] Testing JWT Grant with correct OTP...")
    resp = requests.post(f'{BASE_URL}/verify-otp/', json={'username': 'admin_user', 'otp': otp})
    print(f"Verify OTP Response: {resp.status_code}")
    tokens = resp.json()
    access_token = tokens.get('access')
    assert access_token is not None
    
    print("\n[4] Testing Role-Based Middleware (Admin user on admin endpoint)...")
    headers = {'Authorization': f'Bearer {access_token}'}
    resp = requests.get(f'{BASE_URL}/demo-admin/', headers=headers)
    print(f"Admin Access Response: {resp.status_code} - {resp.json()}")
    assert resp.status_code == 200
    
    print("\n[5] Testing Role-Based Middleware (Normal user on admin endpoint)...")
    setup_db() # reset lock
    
    resp = requests.post(f'{BASE_URL}/login/', json={'username': 'normal_user', 'password': 'password123'})
    
    conn = sqlite3.connect('db.sqlite3')
    c = conn.cursor()
    c.execute("SELECT otp FROM notes_userprofile JOIN auth_user ON auth_user.id = notes_userprofile.user_id WHERE username='normal_user'")
    normal_otp = c.fetchone()[0]
    conn.close()
        
    resp = requests.post(f'{BASE_URL}/verify-otp/', json={'username': 'normal_user', 'otp': normal_otp})
    normal_access_token = resp.json().get('access')
    
    headers = {'Authorization': f'Bearer {normal_access_token}'}
    resp = requests.get(f'{BASE_URL}/demo-admin/', headers=headers)
    print(f"Normal User Access Response: {resp.status_code} - {resp.json()}")
    assert resp.status_code == 403
    
    print("\n--- All Tests Passed Successfully! ---")
    
if __name__ == '__main__':
    # Wait a moment for server to start if running simultaneously
    time.sleep(2)
    try:
        run_tests()
    except Exception as e:
        print("Failure:", e)
