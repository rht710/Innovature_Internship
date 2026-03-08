from django.urls import path
from .views import (
    NoteListCreateView,
    NoteDetailView,
    CategoryListCreateView,
    TagListCreateView
)

urlpatterns = [
    path("notes/", NoteListCreateView.as_view()),
    path("notes/<int:pk>/", NoteDetailView.as_view()),

    path("categories/", CategoryListCreateView.as_view()),
    path("tags/", TagListCreateView.as_view()),
]