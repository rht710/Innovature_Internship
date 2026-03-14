from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Note, Category, Tag, SharedNote
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