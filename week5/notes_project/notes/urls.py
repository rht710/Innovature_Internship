from django.urls import path
from .views import NoteListCreateView, NoteDetailView

urlpatterns = [
    path('notes/', NoteListCreateView.as_view()),
    path('notes/<int:pk>/', NoteDetailView.as_view()),
]