from django.urls import reverse
from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Course, Module, Quiz, Question, AnswerOption, Enrollment

User = get_user_model()

@override_settings(ELASTICSEARCH_DSL_AUTOSYNC=False)
class LearningPlatformTests(APITestCase):
    def setUp(self):
        # Create users

        self.student = User.objects.create_user(
            username='student', password='studentpassword', role=User.Roles.STUDENT
        )
        self.mentor = User.objects.create_user(
            username='mentor', password='mentorpassword', role=User.Roles.MENTOR, is_approved_mentor=True
        )
        self.admin = User.objects.create_user(
            username='admin', password='adminpassword', role=User.Roles.ADMIN
        )

        # Create Course
        self.course = Course.objects.create(
            title='Python Bootcamp',
            description='Learn Python',
            price=0.0, # Free for testing auto-enrollment
            mentor=self.mentor,
            status=Course.Status.PUBLISHED
        )

        # Create Module, Quiz, Question, Options
        self.module = Module.objects.create(course=self.course, title='Module 1', order=1)
        self.quiz = Quiz.objects.create(module=self.module, title='Module 1 Quiz', passing_score=70)
        self.question = Question.objects.create(quiz=self.quiz, question_text='Is Python dynamic?', points=10)
        self.option_yes = AnswerOption.objects.create(question=self.question, option_text='Yes', is_correct=True)
        self.option_no = AnswerOption.objects.create(question=self.question, option_text='No', is_correct=False)

    def test_jwt_auth_login(self):
        """Test authentication returns JWT token"""
        url = reverse('token_obtain_pair')
        data = {'username': 'student', 'password': 'studentpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_course_creation_and_list(self):
        """Test listing courses retrieves published ones"""
        url = reverse('course-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_enrollment_and_progress(self):
        """Test enrolling in a free course and completing lessons"""
        # Login student
        self.client.force_authenticate(user=self.student)
        url = reverse('enrollment-list')
        data = {'course': str(self.course.id)}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['course_title'], 'Python Bootcamp')

    def test_quiz_grading(self):
        """Test quiz submission grading workflow"""
        self.client.force_authenticate(user=self.student)
        url = reverse('quiz-submit', args=[self.quiz.id])
        
        # Submit correct answer
        data = {'submissions': {str(self.question.id): str(self.option_yes.id)}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['passed'])
        self.assertEqual(response.data['score'], 100)

        # Submit incorrect answer
        data = {'submissions': {str(self.question.id): str(self.option_no.id)}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['passed'])
        self.assertEqual(response.data['score'], 0)
