from django.urls import path
from .views import (
    NoteListCreateView,
    NoteDetailView,
    CategoryListCreateView,
    TagListCreateView,
    create_share_link,
    access_shared_note
)

urlpatterns = [

    path("notes/", NoteListCreateView.as_view()),

    path("notes/<int:pk>/", NoteDetailView.as_view()),

    path("categories/", CategoryListCreateView.as_view()),

    path("tags/", TagListCreateView.as_view()),

    path("share/create/<int:note_id>/", create_share_link),

    path("share/<uuid:share_id>/", access_shared_note),

]