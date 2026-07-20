from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserViewSet, CourseViewSet, ModuleViewSet, LessonViewSet,
    QuizViewSet, EnrollmentViewSet, QAMessageViewSet, CourseReviewViewSet,
    PaymentViewSet, NotificationViewSet, ProjectViewSet, ProjectSubmissionViewSet, BadgeViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'modules', ModuleViewSet, basename='module')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'qa-messages', QAMessageViewSet, basename='qa-message')
router.register(r'reviews', CourseReviewViewSet, basename='review')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'project-submissions', ProjectSubmissionViewSet, basename='project-submission')
router.register(r'badges', BadgeViewSet, basename='badge')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
