from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=255)
    content = models.TextField()

    # One-to-many relationship
    category = models.ForeignKey(
    Category,
    on_delete=models.CASCADE,
    related_name="notes",
    null=True,
    blank=True
)

    # Many-to-many relationship
    tags = models.ManyToManyField(
        Tag,
        related_name="notes",
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title