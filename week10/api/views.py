from rest_framework import viewsets, filters, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, Cart, CartItem, ProductImage
from .serializers import CategorySerializer, ProductSerializer, CartSerializer, CartItemSerializer, UserSerializer, ProductImageSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Sum, F
import django_filters

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        images = request.FILES.getlist('image')
        product_id = request.data.get('product')
        
        if not product_id:
            return Response({"product": ["This field is required."]}, status=400)
            
        if not images:
            return Response({"image": ["No files were uploaded. Please re-select your files in Postman."]}, status=400)
            
        # If multiple images are provided, create them all
        if len(images) > 1:
            created_objects = []
            for img_file in images:
                serializer = self.get_serializer(data={'product': product_id, 'image': img_file})
                serializer.is_valid(raise_exception=True)
                serializer.save()
                created_objects.append(serializer.data)
            return Response(created_objects, status=201)
            
        # Otherwise, proceed with standard single-file creation
        return super().create(request, *args, **kwargs)

class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    category = django_filters.CharFilter(field_name="category__slug")

    class Meta:
        model = Product
        fields = ['category', 'min_price', 'max_price']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(product_count=Count('products')).all()
    serializer_class = CategorySerializer

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users only see items in their own cart
        return CartItem.objects.filter(cart__user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        product = serializer.validated_data.get('product')
        quantity = serializer.validated_data.get('quantity', 1)

        # Update quantity if product already exists in cart, otherwise create it
        item = CartItem.objects.filter(cart=cart, product=product).first()
        if item:
            item.quantity += quantity
            item.save()
        else:
            item = CartItem.objects.create(cart=cart, product=product, quantity=quantity)
            
        # Use serializer to return response data
        response_serializer = self.get_serializer(item)
        return Response(response_serializer.data, status=201)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "user": UserSerializer(user).data,
                "token": token.key
            })
        return Response(serializer.errors, status=400)

class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })
