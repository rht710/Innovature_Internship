import os
import django
import sys
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from api.models import Product, Category, ProductImage

def test_image_upload():
    # Ensure a category and product exist
    cat, _ = Category.objects.get_or_create(name="Test Category", slug="test-cat")
    prod, _ = Product.objects.get_or_create(
        name="Test Product", 
        slug="test-product",
        defaults={'category': cat, 'price': 100, 'stock': 10}
    )

    # Create a dummy image
    img = Image.new('RGB', (800, 600), color='red')
    img_io = BytesIO()
    img.save(img_io, format='JPEG')
    img_content = img_io.getvalue()
    
    image_file = SimpleUploadedFile("test_image.jpg", img_content, content_type="image/jpeg")

    # Upload the image
    print(f"Uploading image for product: {prod.name}")
    prod_img = ProductImage.objects.create(product=prod, image=image_file)

    print(f"Original image saved at: {prod_img.image.path}")
    print(f"Thumbnail image saved at: {prod_img.thumbnail.path}")

    # Check if thumbnail exists and has correct size
    if os.path.exists(prod_img.thumbnail.path):
        thumb = Image.open(prod_img.thumbnail.path)
        print(f"Thumbnail dimensions: {thumb.size}")
        if thumb.size[0] <= 200 and thumb.size[1] <= 200:
            print("SUCCESS: Thumbnail generated correctly!")
        else:
            print("FAILURE: Thumbnail size incorrect.")
    else:
        print("FAILURE: Thumbnail file not found.")

if __name__ == "__main__":
    test_image_upload()
