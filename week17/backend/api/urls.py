from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, CartViewSet, RegisterView, LoginView, ProductImageViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'carts', CartViewSet)
router.register(r'product-images', ProductImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]
