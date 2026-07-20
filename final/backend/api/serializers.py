import os

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Course, Module, Lesson, Quiz, Question, AnswerOption,
    Enrollment, LessonProgress, QAMessage, PaymentTransaction,
    CourseReview, Notification, Badge, UserBadge, Project, ProjectSubmission
)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'profile_picture', 'bio', 'is_approved_mentor', 'xp', 'level')
        read_only_fields = ('id', 'is_approved_mentor', 'xp', 'level')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        # If mentor, starts as not approved until admin approves them
        if user.role == User.Roles.MENTOR:
            user.is_approved_mentor = False
        user.save()
        return user

class AnswerOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerOption
        fields = ('id', 'question', 'option_text', 'is_correct')

class QuestionSerializer(serializers.ModelSerializer):
    options = AnswerOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'quiz', 'question_text', 'points', 'options')

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'module', 'title', 'passing_score', 'questions')

    def validate(self, attrs):
        questions = self.initial_data.get('questions')
        if questions is not None and len(questions) < 5:
            raise serializers.ValidationError('A quiz must contain at least 5 questions.')
        return attrs

class LessonSerializer(serializers.ModelSerializer):
    attachment = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ('id', 'module', 'title', 'description', 'content_type', 'video_url', 'file', 'attachment', 'order')

    def _absolute_url(self, obj, field_name):
        request = self.context.get('request')
        f = getattr(obj, field_name)
        if not f:
            return None
        url = f.url  # e.g. /media/lessons/attachments/file.pdf
        if request:
            return request.build_absolute_uri(url)
        # fallback: use configured API base URL if present, otherwise localhost
        backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
        return f'{backend_url}{url}'

    def get_attachment(self, obj):
        return self._absolute_url(obj, 'attachment')

    def get_file(self, obj):
        return self._absolute_url(obj, 'file')

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'module', 'title', 'description', 'starter_code')

class ProjectSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='enrollment.student.username')
    project_title = serializers.ReadOnlyField(source='project.title')

    class Meta:
        model = ProjectSubmission
        fields = ('id', 'enrollment', 'student_name', 'project', 'project_title', 'code_submitted', 'grade', 'score', 'ai_review', 'submitted_at')
        read_only_fields = ('id', 'grade', 'score', 'ai_review', 'submitted_at')

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ('id', 'name', 'description', 'icon_type')

class UserBadgeSerializer(serializers.ModelSerializer):
    badge_name = serializers.ReadOnlyField(source='badge.name')
    badge_description = serializers.ReadOnlyField(source='badge.description')
    badge_icon = serializers.ReadOnlyField(source='badge.icon_type')

    class Meta:
        model = UserBadge
        fields = ('id', 'user', 'badge', 'badge_name', 'badge_description', 'badge_icon', 'unlocked_at')

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ('id', 'course', 'title', 'order', 'lessons', 'quizzes', 'projects')

class CourseSerializer(serializers.ModelSerializer):
    mentor_name = serializers.ReadOnlyField(source='mentor.username')
    enrollment_count = serializers.SerializerMethodField()
    modules = ModuleSerializer(many=True, read_only=True)
    suggested_materials = serializers.SerializerMethodField()
    category = serializers.ChoiceField(choices=Course.Categories.choices, required=False)

    class Meta:
        model = Course
        fields = ('id', 'title', 'slug', 'description', 'price', 'mentor', 'mentor_name', 'status', 'category', 'average_rating', 'created_at', 'updated_at', 'modules', 'suggested_materials', 'enrollment_count')
        read_only_fields = ('id', 'slug', 'mentor', 'average_rating', 'created_at', 'updated_at')

    def get_enrollment_count(self, obj):
        return obj.enrollments.count()

    def get_suggested_materials(self, obj):
        title_lower = obj.title.lower()
        
        # 1. Web Development suggestions
        if "web" in title_lower or "html" in title_lower or "css" in title_lower:
            return [
                {
                    "type": "YOUTUBE",
                    "title": "HTML & CSS Full Course for Beginners (6 Hours)",
                    "url": "https://www.youtube.com/watch?v=mU6anWqZJzY",
                    "description": "Comprehensive HTML/CSS course by freeCodeCamp to master layouts."
                },
                {
                    "type": "YOUTUBE",
                    "title": "Learn CSS Flexbox in 20 Minutes",
                    "url": "https://www.youtube.com/watch?v=fYq5PXgSsbE",
                    "description": "Visual, quick breakdown of Flexbox alignment by Web Dev Simplified."
                },
                {
                    "type": "DOCUMENT",
                    "title": "MDN Web Docs: HTML & CSS guide",
                    "url": "https://developer.mozilla.org/en-US/docs/Web",
                    "description": "The absolute standard documentation for web developers."
                },
                {
                    "type": "DOCUMENT",
                    "title": "CSS-Tricks: Complete Guide to Flexbox",
                    "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
                    "description": "The ultimate visual reference cheat sheet for flex properties."
                }
            ]
            
        # 2. Python suggestions
        elif "python" in title_lower:
            return [
                {
                    "type": "YOUTUBE",
                    "title": "Python for Beginners - Full Course (6 Hours)",
                    "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
                    "description": "Popular starter tutorial by Programming with Mosh."
                },
                {
                    "type": "YOUTUBE",
                    "title": "Python OOP Tutorials - Instantiating & Inheritance",
                    "url": "https://www.youtube.com/watch?v=ZDa-Z5JzLYM",
                    "description": "Master OOP structures with Corey Schafer's legendary playlist."
                },
                {
                    "type": "DOCUMENT",
                    "title": "Official Python Documentation (3.x)",
                    "url": "https://docs.python.org/3/",
                    "description": "Standard documentation and standard library guides."
                }
            ]
            
        # 3. React suggestions
        elif "react" in title_lower:
            return [
                {
                    "type": "YOUTUBE",
                    "title": "React JS Full Course for Beginners (12 Hours)",
                    "url": "https://www.youtube.com/watch?v=bMknfKXIFA8",
                    "description": "Step-by-step React framework crash course by freeCodeCamp."
                },
                {
                    "type": "DOCUMENT",
                    "title": "Official React Reference Docs",
                    "url": "https://react.dev",
                    "description": "Explore the official guidelines, custom hooks API, and rules of React."
                }
            ]
            
        # 4. Fallback/Dynamic suggestions for any custom created course
        else:
            from django.utils.http import urlencode
            query_yt = urlencode({'search_query': f"learn {obj.title}"})
            query_gg = urlencode({'q': f"{obj.title} documentation tutorial"})
            return [
                {
                    "type": "YOUTUBE",
                    "title": f"Search YouTube: Learn {obj.title}",
                    "url": f"https://www.youtube.com/results?{query_yt}",
                    "description": f"Find video tutorials and crash courses on {obj.title}."
                },
                {
                    "type": "DOCUMENT",
                    "title": f"Search Google: {obj.title} Docs",
                    "url": f"https://www.google.com/search?{query_gg}",
                    "description": f"Explore official guides, reference manuals, and API libraries."
                }
            ]

class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ('id', 'enrollment', 'lesson', 'is_completed', 'completed_at')

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    student_name = serializers.ReadOnlyField(source='student.username')

    class Meta:
        model = Enrollment
        fields = ('id', 'student', 'student_name', 'course', 'course_title', 'progress_percentage', 'is_completed', 'certificate_url', 'enrolled_at', 'completed_at')
        read_only_fields = ('id', 'student', 'progress_percentage', 'is_completed', 'certificate_url', 'enrolled_at', 'completed_at')

class QAMessageSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    recipient_name = serializers.ReadOnlyField(source='recipient.username')
    replies = serializers.SerializerMethodField()

    class Meta:
        model = QAMessage
        fields = ('id', 'course', 'user', 'user_name', 'recipient', 'recipient_name', 'parent_message', 'message', 'is_read', 'is_moderated', 'created_at', 'replies')
        read_only_fields = ('id', 'user', 'recipient', 'is_read', 'is_moderated', 'created_at')

    def get_replies(self, obj):
        if obj.replies.exists():
            return QAMessageSerializer(obj.replies.filter(is_moderated=False), many=True).data
        return []

class PaymentTransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    course_title = serializers.ReadOnlyField(source='course.title')

    class Meta:
        model = PaymentTransaction
        fields = ('id', 'user', 'user_name', 'course', 'course_title', 'amount', 'payment_gateway', 'transaction_id', 'status', 'created_at')
        read_only_fields = ('id', 'user', 'status', 'created_at')

class CourseReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')

    class Meta:
        model = CourseReview
        fields = ('id', 'course', 'student', 'student_name', 'rating', 'review_text', 'is_moderated', 'created_at')
        read_only_fields = ('id', 'student', 'is_moderated', 'created_at')

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'user', 'title', 'message', 'notification_type', 'is_read', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')
