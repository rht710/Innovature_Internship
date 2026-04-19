import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def verify():
    print("--- Starting Verification ---")
    
    # 1. Login as the test user created earlier or admin
    login_data = {"username": "admin", "password": "admin123"}
    r = requests.post(f"{BASE_URL}/login/", json=login_data)
    if r.status_code != 200:
        print("Login failed. Make sure server is running and admin exists.")
        return
    
    token = r.json().get('token')
    headers = {"Authorization": f"Token {token}"}
    print(f"Logged in. Token: {token[:10]}...")

    # 2. Get a product ID
    prod_r = requests.get(f"{BASE_URL}/products/")
    products = prod_r.json().get('results', [])
    if not products:
        print("No products found to add to cart.")
        return
    product_id = products[0]['id']
    product_name = products[0]['name']
    print(f"Selected product: {product_name} (ID: {product_id})")

    # 3. Add item to cart via new endpoint
    print("\n--- Testing POST /api/cart-items/ ---")
    add_data = {"product": product_id, "quantity": 5}
    add_r = requests.post(f"{BASE_URL}/cart-items/", json=add_data, headers=headers)
    print(f"Status: {add_r.status_code}")
    print(f"Response: {add_r.json()}")

    if add_r.status_code != 201:
        print("Failed to add item to cart.")
        return

    # 4. Verify in Cart view
    print("\n--- Verifying in GET /api/carts/ ---")
    cart_r = requests.get(f"{BASE_URL}/carts/", headers=headers)
    print(f"Status: {cart_r.status_code}")
    cart_data = cart_r.json()
    # Check if item is in cart (Handle paginated result)
    cart_results = cart_data.get('results', [])
    if not cart_results:
         # If not paginated, use direct access
         cart_items = cart_data.get('items', [])
    else:
         cart_items = cart_results[0].get('items', [])

    found = False
    for item in cart_items:
        if item['product'] == product_id:
            found = True
            print(f"SUCCESS: Found {item['quantity']} of {product_name} in cart.")
            break
    
    if not found:
        print("FAILURE: Item not found in cart after adding.")

if __name__ == "__main__":
    verify()
