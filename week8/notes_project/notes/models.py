from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Note(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notes"
    )

    title = models.CharField(max_length=255)

    content = models.TextField()

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    tags = models.ManyToManyField(
        Tag,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class SharedNote(models.Model):

    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name="shared_links"
    )

    share_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False
    )

    expires_at = models.DateTimeField(
        null=True,
        blank=True
    )

    access_count = models.IntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    def __str__(self):
        return str(self.share_id)


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User')
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    failed_login_attempts = models.IntegerField(default=0)
    failed_otp_attempts = models.IntegerField(default=0)
    is_locked = models.BooleanField(default=False)
    lockout_until = models.DateTimeField(null=True, blank=True)
    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s profile"