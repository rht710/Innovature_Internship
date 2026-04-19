import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from api.models import Category, Product, Cart, CartItem
from django.contrib.auth.models import User

def seed():
    print("Seeding data...")
    
    # Create Superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Created superuser: admin / admin123")

    # Create Categories
    categories_data = [
        {'name': 'Electronics', 'description': 'Gadgets and devices'},
        {'name': 'Fashion', 'description': 'Clothing and accessories'},
        {'name': 'Home & Garden', 'description': 'Furniture and tools'},
        {'name': 'Books', 'description': 'All kinds of books'},
    ]
    
    categories = []
    for cat_data in categories_data:
        cat, created = Category.objects.get_or_create(name=cat_data['name'], defaults={'description': cat_data['description']})
        categories.append(cat)
        if created:
            print(f"Created category: {cat.name}")

    # Create Products
    products_data = [
        {'name': 'Smartphone X', 'price': 999.99, 'category': 'Electronics', 'description': 'The latest smartphone'},
        {'name': 'Laptop Pro', 'price': 1499.99, 'category': 'Electronics', 'description': 'Powerful laptop for pros'},
        {'name': 'Bluetooth Headphones', 'price': 199.99, 'category': 'Electronics', 'description': 'Noise cancelling wireless headphones'},
        {'name': 'Cotton T-Shirt', 'price': 29.99, 'category': 'Fashion', 'description': 'Comfortable 100% cotton tee'},
        {'name': 'Blue Jeans', 'price': 59.99, 'category': 'Fashion', 'description': 'Classic fit blue jeans'},
        {'name': 'Air Fryer', 'price': 129.99, 'category': 'Home & Garden', 'description': 'Healthy frying with less oil'},
        {'name': 'Garden Shovel', 'price': 15.50, 'category': 'Home & Garden', 'description': 'Durable steel shovel'},
        {'name': 'Python Programming Book', 'price': 45.00, 'category': 'Books', 'description': 'Learn Python the hard way'},
        {'name': 'Sci-Fi Novel', 'price': 12.99, 'category': 'Books', 'description': 'A journey to the stars'},
        {'name': 'Gourmet Coffee Beans', 'price': 25.00, 'category': 'Home & Garden', 'description': 'Premium roasted arabica beans'},
    ]

    for p_data in products_data:
        cat = Category.objects.get(name=p_data['category'])
        product, created = Product.objects.get_or_create(
            name=p_data['name'], 
            defaults={
                'price': p_data['price'],
                'category': cat,
                'description': p_data['description'],
                'stock': random.randint(10, 100)
            }
        )
        if created:
            print(f"Created product: {product.name}")

    # Create a Cart for admin
    admin_user = User.objects.get(username='admin')
    cart, created = Cart.objects.get_or_create(user=admin_user)
    if created:
        print(f"Created cart for user: {admin_user.username}")

    # Add items to cart
    if created:
        items_to_add = random.sample(list(Product.objects.all()), 3)
        for prod in items_to_add:
            CartItem.objects.create(cart=cart, product=prod, quantity=random.randint(1, 3))
            print(f"Added {prod.name} to cart")

    print("Seeding complete!")

if __name__ == '__main__':
    seed()
