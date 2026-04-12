import os
from io import BytesIO
from PIL import Image
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError

def validate_image_size(image):
    file_size = image.size
    limit_mb = 5
    if file_size > limit_mb * 1024 * 1024:
        raise ValidationError(f"Max size of file is {limit_mb} MB")

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    image_url = models.URLField(max_length=500, blank=True) # Keep for legacy support
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/', validators=[validate_image_size])
    thumbnail = models.ImageField(upload_to='products/thumbnails/', editable=False, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Always run the base save first
        super().save(*args, **kwargs)
        
        # Only create thumbnail if the image field has a valid file path
        if self.image and hasattr(self.image, 'path') and not self.thumbnail:
            self.create_thumbnail()
            super().save(update_fields=['thumbnail'])

    def create_thumbnail(self):
        try:
            # Ensure we start from the beginning of the file
            self.image.seek(0)
            img = Image.open(self.image)
            
            # Convert to RGB if it's RGBA (for JPEG compatibility)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
                
            img.thumbnail((200, 200))
            
            thumb_io = BytesIO()
            # Default to JPEG if format is unknown
            img.save(thumb_io, format='JPEG', quality=85)
            
            thumb_file = ContentFile(thumb_io.getvalue())
            # Get original filename or use default
            name = os.path.basename(self.image.name) if self.image.name else "product_image.jpg"
            if not name.lower().endswith(('.jpg', '.jpeg', '.png')):
                name += ".jpg"
                
            self.thumbnail.save(f"thumb_{name}", thumb_file, save=False)
        except Exception as e:
            print(f"Thumbnail error: {e}")
            # If thumbnail fails, we still want to save the original image

    def __str__(self):
        return f"Image for {self.product.name}"

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
