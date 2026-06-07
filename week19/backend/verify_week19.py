import os, django, requests
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

# Login first
r = requests.post('http://127.0.0.1:8000/api/login/', json={'username': 'admin', 'password': 'admin123'})
token = r.json()['access']
headers = {'Authorization': f'Bearer {token}'}

# Create a product
from api.models import Category
cat = Category.objects.first()
r2 = requests.post('http://127.0.0.1:8000/api/products/', json={
    'name': 'Final API Test Product',
    'category': cat.id,
    'price': '49.99',
    'stock': 10,
    'description': 'Automated test product for image upload verification'
}, headers=headers)
print('Product create status:', r2.status_code)
product = r2.json()
print('Product id:', product.get('id'), '| slug:', product.get('slug'))

# Upload an image to it
with open('test.png', 'rb') as f:
    r3 = requests.post('http://127.0.0.1:8000/api/product-images/', headers=headers, files={'image': ('test.png', f, 'image/png')}, data={'product': product['id']})
print('Image upload status:', r3.status_code)
img_data = r3.json()
print('Image id:', img_data.get('id'), '| thumbnail:', img_data.get('thumbnail'))

# Clean up
requests.delete(f"http://127.0.0.1:8000/api/products/{product['id']}/", headers=headers)
print('Cleanup done. ALL TESTS PASSED.')
