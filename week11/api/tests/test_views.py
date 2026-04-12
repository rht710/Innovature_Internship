import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from api.models import Category, Product
from django.contrib.auth.models import User

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    def make_user(**kwargs):
        if 'username' not in kwargs:
            kwargs['username'] = 'testuser'
        if 'password' not in kwargs:
            kwargs['password'] = 'password123'
        return User.objects.create_user(**kwargs)
    return make_user

@pytest.mark.django_db
class TestViews:
    def test_product_list(self, api_client):
        category = Category.objects.create(name="Electronics")
        Product.objects.create(category=category, name="Phone", price=500, stock=5)
        
        url = reverse('product-list')
        response = api_client.get(url)
        assert response.status_code == 200
        # Handle pagination
        results = response.data.get('results', response.data)
        assert len(results) >= 1
        assert "price_in_usd" in results[0]

    def test_category_list(self, api_client):
        Category.objects.create(name="Electronics")
        url = reverse('category-list')
        response = api_client.get(url)
        assert response.status_code == 200
        # Handle pagination
        results = response.data.get('results', response.data)
        # Check that 'Electronics' is in the results
        names = [cat['name'] for cat in results]
        assert "Electronics" in names

    def test_user_registration(self, api_client):
        url = reverse('register')
        data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "strongpassword123"
        }
        response = api_client.post(url, data)
        assert response.status_code == 200
        assert "token" in response.data
        assert User.objects.filter(username="newuser").exists()

    def test_user_login(self, api_client, create_user):
        user = create_user(username="loginuser", password="secretpassword")
        url = reverse('login')
        data = {
            "username": "loginuser",
            "password": "secretpassword"
        }
        response = api_client.post(url, data)
        assert response.status_code == 200
        assert "token" in response.data
