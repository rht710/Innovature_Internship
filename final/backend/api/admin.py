from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Course, Module, Lesson, Quiz, Question, 
    AnswerOption, Enrollment, LessonProgress, QAMessage, 
    PaymentTransaction, CourseReview, Notification
)

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'role', 'is_approved_mentor', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Profile Options', {'fields': ('role', 'profile_picture', 'bio', 'is_approved_mentor')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Profile Options', {'fields': ('role', 'profile_picture', 'bio', 'is_approved_mentor')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Course)
admin.site.register(Module)
admin.site.register(Lesson)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(AnswerOption)
admin.site.register(Enrollment)
admin.site.register(LessonProgress)
admin.site.register(QAMessage)
admin.site.register(PaymentTransaction)
admin.site.register(CourseReview)
admin.site.register(Notification)
