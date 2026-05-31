import os
import django
import sys
from PIL import Image, ImageDraw
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from api.models import Product, Category, ProductImage

def create_smartphone():
    # 1. Create/Get Category for Smartphones
    cat, _ = Category.objects.get_or_create(name="Smartphones", slug="smartphones")
    
    # 2. Create the Galaxy S24 Ultra Product
    prod, created = Product.objects.get_or_create(
        name="Samsung Galaxy S24 Ultra",
        slug="samsung-s24-ultra",
        defaults={
            'category': cat,
            'description': "Snapdragon 8 Gen 3, 200MP Camera, Titanium Frame, 5000mAh Battery.",
            'price': 1299.99,
            'stock': 25
        }
    )
    
    if created:
        print(f"Created new product: {prod.name}")
    else:
        print(f"Product already exists: {prod.name}")

    # 3. Create a High-Resolution Dummy Image (2000x2000 pixels)
    img = Image.new('RGB', (2000, 2000), color='#1e293b') # Dark slate background
    draw = ImageDraw.Draw(img)
    draw.rectangle([600, 200, 1400, 1800], outline="white", width=20)
    
    img_io = BytesIO()
    img.save(img_io, format='JPEG')
    image_content = img_io.getvalue()
    
    image_file = SimpleUploadedFile("s24_ultra_front.jpg", image_content, content_type="image/jpeg")

    # 4. Upload to the ProductImage model (This triggers your auto-thumbnail logic!)
    new_image = ProductImage.objects.create(product=prod, image=image_file)
    print(f"Uploaded high-res image: {new_image.image.name}")
    print(f"Thumbnail auto-generated: {new_image.thumbnail.name}")

if __name__ == "__main__":
    create_smartphone()
