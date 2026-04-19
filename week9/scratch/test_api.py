import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_flow():
    # 1. Register
    print("--- Testing Registration ---")
    reg_data = {
        "username": "testuser_rohit",
        "email": "rohit@example.com",
        "password": "testpassword123"
    }
    try:
        r = requests.post(f"{BASE_URL}/register/", json=reg_data)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
        token = r.json().get('token')
    except Exception as e:
        print(f"Error: {e}")
        return

    # 2. Login (just to verify)
    print("\n--- Testing Login ---")
    login_data = {
        "username": "testuser_rohit",
        "password": "testpassword123"
    }
    r = requests.post(f"{BASE_URL}/login/", json=login_data)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()}")
    token = r.json().get('token')
    headers = {"Authorization": f"Token {token}"}

    # 3. List Categories
    print("\n--- Testing Categories ---")
    r = requests.get(f"{BASE_URL}/categories/")
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json()[:2], indent=2)} (showing first 2)")

    # 4. List Products
    print("\n--- Testing Products ---")
    r = requests.get(f"{BASE_URL}/products/")
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json().get('results')[:2], indent=2)} (showing first 2)")

    # 5. Search Products
    print("\n--- Testing Search ---")
    r = requests.get(f"{BASE_URL}/products/?search=phone")
    print(f"Status: {r.status_code}")
    print(f"Search Results Count: {r.json().get('count')}")

    # 6. Filter Products
    print("\n--- Testing Filter (Electronics) ---")
    r = requests.get(f"{BASE_URL}/products/?category=electronics&min_price=100")
    print(f"Status: {r.status_code}")
    print(f"Filter Results Count: {r.json().get('count')}")

    # 7. Add to Cart (Checking if possible)
    print("\n--- Testing Add to Cart (Attempt) ---")
    # Trying to send product and quantity to /api/carts/
    cart_data = {
        "product": 1,
        "quantity": 2
    }
    r = requests.post(f"{BASE_URL}/carts/", json=cart_data, headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()}")

    # 8. View Cart
    print("\n--- Testing View Cart ---")
    r = requests.get(f"{BASE_URL}/carts/", headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")

if __name__ == "__main__":
    test_flow()
