from rest_framework import serializers
from .models import Note, Category, Tag, SharedNote


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = "__all__"


class TagSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tag
        fields = "__all__"


class NoteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Note
        fields = "__all__"
        read_only_fields = ["user"]


class SharedNoteSerializer(serializers.ModelSerializer):

    class Meta:
        model = SharedNote
        fields = "__all__"
        read_only_fields = ["share_id", "access_count"]