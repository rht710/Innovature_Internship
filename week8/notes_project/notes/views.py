from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
import random

from .models import Note, Category, Tag, SharedNote, UserProfile
from .serializers import (
    NoteSerializer,
    CategorySerializer,
    TagSerializer,
    SharedNoteSerializer
)


class NoteListCreateView(generics.ListCreateAPIView):

    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)


class CategoryListCreateView(generics.ListCreateAPIView):

    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TagListCreateView(generics.ListCreateAPIView):

    queryset = Tag.objects.all()
    serializer_class = TagSerializer


# CREATE SHARE LINK

@api_view(["POST"])
def create_share_link(request, note_id):

    note = get_object_or_404(
        Note,
        id=note_id,
        user=request.user
    )

    expires_at = request.data.get("expires_at")

    share = SharedNote.objects.create(
        note=note,
        expires_at=expires_at
    )

    serializer = SharedNoteSerializer(share)

    return Response(serializer.data)


# ACCESS SHARED NOTE (PUBLIC)

@api_view(["GET"])
def access_shared_note(request, share_id):

    share = get_object_or_404(
        SharedNote,
        share_id=share_id
    )

    if share.is_expired():
        return Response(
            {"error": "Link expired"},
            status=403
        )

    share.access_count += 1
    share.save()

    note = share.note

    return Response({
        "title": note.title,
        "content": note.content,
        "access_count": share.access_count
    })


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=400)
            
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        if profile.is_locked:
            return Response({"error": "Account is permanently locked. Please contact admin."}, status=403)
            
        if profile.lockout_until and timezone.now() < profile.lockout_until:
            remaining = (profile.lockout_until - timezone.now()).total_seconds()
            minutes = int(remaining // 60)
            seconds = int(remaining % 60)
            return Response({"error": f"Account is temporarily locked. Try again in {minutes}m {seconds}s."}, status=403)
            
        user_auth = authenticate(username=username, password=password)
        if user_auth is None:
            profile.failed_login_attempts += 1
            if profile.failed_login_attempts >= 5:
                # Set temporary lockout for 5 minutes
                profile.lockout_until = timezone.now() + timezone.timedelta(minutes=5)
            profile.save()
            return Response({"error": f"Invalid credentials. Failed attempts: {profile.failed_login_attempts}"}, status=400)
            
        # Successful credentials
        profile.failed_login_attempts = 0
        profile.failed_otp_attempts = 0
        profile.lockout_until = None
        
        # Generate OTP
        otp_code = str(random.randint(100000, 999999))
        profile.otp = otp_code
        profile.otp_created_at = timezone.now()
        profile.save()
        
        # Send Email
        try:
            send_mail(
                'Your OTP Code',
                f'Your OTP code is {otp_code}. It will expire in 5 minutes.',
                'noreply@notesapp.com',
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"error": f"Failed to send email: {str(e)}", "otp": otp_code}, status=500)
            
        return Response({"message": "OTP sent to your email."})


class VerifyOTPView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')
        
        try:
            user = User.objects.get(username=username)
            profile = user.profile
        except (User.DoesNotExist, getattr(UserProfile, 'DoesNotExist', Exception)):
            return Response({"error": "Invalid user"}, status=400)
            
        if profile.is_locked:
            return Response({"error": "Account is permanently locked."}, status=403)

        if profile.lockout_until and timezone.now() < profile.lockout_until:
            remaining = (profile.lockout_until - timezone.now()).total_seconds()
            minutes = int(remaining // 60)
            seconds = int(remaining % 60)
            return Response({"error": f"Account is temporarily locked. Try again in {minutes}m {seconds}s."}, status=403)
            
        if profile.otp != otp:
            profile.failed_otp_attempts += 1
            if profile.failed_otp_attempts >= 5:
                profile.lockout_until = timezone.now() + timezone.timedelta(minutes=5)
            profile.save()
            return Response({"error": f"Invalid OTP. Failed attempts: {profile.failed_otp_attempts}"}, status=400)
            
        if profile.otp_created_at:
            time_difference = timezone.now() - profile.otp_created_at
            if time_difference.total_seconds() > 300: # 5 minutes
                return Response({"error": "OTP has expired"}, status=400)
                
        # OTP is valid
        profile.otp = None
        profile.otp_created_at = None
        profile.failed_otp_attempts = 0
        profile.failed_login_attempts = 0
        profile.lockout_until = None
        profile.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class AdminOnlyView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({"message": "Welcome Admin! You have access to this endpoint."})