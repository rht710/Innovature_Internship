import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from api.models import Category, Product, ProductImage
from io import BytesIO
from PIL import Image

@pytest.mark.django_db
class TestModels:
    def test_category_slug_generation(self):
        category = Category.objects.create(name="Electronics")
        assert category.slug == "electronics"

    def test_product_slug_generation(self):
        category = Category.objects.create(name="Electronics")
        product = Product.objects.create(
            category=category,
            name="Super Phone",
            description="A phone",
            price=999.99,
            stock=10
        )
        assert product.slug == "super-phone"

    def test_product_image_thumbnail_generation(self):
        # Create a small valid image in memory
        file_content = BytesIO()
        image = Image.new('RGB', (500, 500), color='red')
        image.save(file_content, format='JPEG')
        file_content.seek(0)
        
        uploaded_image = SimpleUploadedFile(
            name="test.jpg",
            content=file_content.read(),
            content_type="image/jpeg"
        )
        
        category = Category.objects.create(name="Electronics")
        product = Product.objects.create(
            category=category,
            name="Super Phone",
            description="A phone",
            price=999.99,
            stock=10
        )
        
        product_image = ProductImage.objects.create(
            product=product,
            image=uploaded_image
        )
        
        # Verify thumbnail is created
        assert product_image.thumbnail.name != ""
        assert "thumb_" in product_image.thumbnail.name
