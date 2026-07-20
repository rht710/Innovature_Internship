from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.test import override_settings
from api.models import Course, Module, Lesson, Quiz, Question, AnswerOption, Badge, Project

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with comprehensive sample courses, modules, lessons, quizzes, badges, projects and test users.'

    def _attach_lesson_document(self, lesson, filename, content):
        lesson.attachment.save(filename, ContentFile(content.encode('utf-8')))
        lesson.save()

    @override_settings(ELASTICSEARCH_DSL_AUTOSYNC=False)
    def handle(self, *args, **options):
        self.stdout.write("Deleting existing data...")
        Project.objects.all().delete()
        Badge.objects.all().delete()
        AnswerOption.objects.all().delete()
        Question.objects.all().delete()
        Quiz.objects.all().delete()
        Lesson.objects.all().delete()
        Module.objects.all().delete()
        Course.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write("Creating users...")
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpassword',
            role=User.Roles.ADMIN
        )
        mentor = User.objects.create_user(
            username='mentor',
            email='mentor@example.com',
            password='mentorpassword',
            role=User.Roles.MENTOR,
            is_approved_mentor=True
        )
        student = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='studentpassword',
            role=User.Roles.STUDENT
        )

        self.stdout.write("Creating system badges...")
        Badge.objects.create(
            name="First Steps",
            description="Completed your very first lesson on Lumina.",
            icon_type="SHIELD"
        )
        Badge.objects.create(
            name="Quiz Master",
            description="Scored 100% on any quiz assessment.",
            icon_type="STAR"
        )
        Badge.objects.create(
            name="Project Master",
            description="Completed an AI-graded project assignment successfully.",
            icon_type="CROWN"
        )
        Badge.objects.create(
            name="Tech Explorer",
            description="Successfully finished a Technology category course.",
            icon_type="SHIELD"
        )

        self.stdout.write("Creating courses...")
        
        # =========================================================================
        # --- COURSE 1: Web Development ---
        # =========================================================================
        c1 = Course.objects.create(
            title="Introduction to Web Development",
            description="Master the fundamentals of modern web development. Learn to build clean, responsive, and interactive websites using HTML5, CSS3, and modern Javascript (ES6+).",
            price=19.99,
            mentor=mentor,
            category=Course.Categories.TECH,
            status=Course.Status.PUBLISHED
        )
        
        # Module 1
        m1 = Module.objects.create(course=c1, title="HTML5 Semantic Structures", order=1)
        lesson1 = Lesson.objects.create(
            module=m1,
            title="Introduction to the Web & HTML5 Basics",
            description="Understand how the client-server architecture works, how browsers render pages, and write your first semantic HTML5 elements.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=1
        )
        self._attach_lesson_document(lesson1, 'html5_basics.txt', 'This lesson document covers HTML5 structure, semantic tags, and how browsers render the DOM.')

        lesson2 = Lesson.objects.create(
            module=m1,
            title="Forms, Inputs, & Media Elements",
            description="Deep dive into text fields, drop-downs, submit buttons, checkboxes, radio selections, and embedding audio/video players.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=2
        )
        self._attach_lesson_document(lesson2, 'forms_and_media.txt', 'This lesson document explains HTML forms, input types, buttons, and how to embed media in web pages.')

        lesson3 = Lesson.objects.create(
            module=m1,
            title="SEO Basics & Meta Tags",
            description="Learn how to optimize web pages for search engines using standard meta titles, open graph protocols, and viewport tags.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=3
        )
        self._attach_lesson_document(lesson3, 'seo_meta_tags.txt', 'This lesson document teaches SEO fundamentals, meta tags, titles, and descriptions for accessible web pages.')
        
        q1 = Quiz.objects.create(module=m1, title="HTML5 Structural Quiz", passing_score=70)
        q1_q1 = Question.objects.create(quiz=q1, question_text="Which HTML5 tag represents independent self-contained content?", points=10)
        AnswerOption.objects.create(question=q1_q1, option_text="<article>", is_correct=True)
        AnswerOption.objects.create(question=q1_q1, option_text="<section>", is_correct=False)
        AnswerOption.objects.create(question=q1_q1, option_text="<div>", is_correct=False)

        q1_q2 = Question.objects.create(quiz=q1, question_text="What is the purpose of the 'alt' attribute on an image?", points=10)
        AnswerOption.objects.create(question=q1_q2, option_text="Provides alternative text description for screen readers and accessibility", is_correct=True)
        AnswerOption.objects.create(question=q1_q2, option_text="Sets the image alignment", is_correct=False)
        AnswerOption.objects.create(question=q1_q2, option_text="Specifies the image border style", is_correct=False)

        q1_q3 = Question.objects.create(quiz=q1, question_text="Which HTML5 sectioning element is best for site navigation content?", points=10)
        AnswerOption.objects.create(question=q1_q3, option_text="<nav>", is_correct=True)
        AnswerOption.objects.create(question=q1_q3, option_text="<aside>", is_correct=False)
        AnswerOption.objects.create(question=q1_q3, option_text="<footer>", is_correct=False)

        q1_q4 = Question.objects.create(quiz=q1, question_text="What is the correct HTML5 element for self-contained content like a blog post?", points=10)
        AnswerOption.objects.create(question=q1_q4, option_text="<article>", is_correct=True)
        AnswerOption.objects.create(question=q1_q4, option_text="<header>", is_correct=False)
        AnswerOption.objects.create(question=q1_q4, option_text="<section>", is_correct=False)

        q1_q5 = Question.objects.create(quiz=q1, question_text="Which element should be used for the main document title in HTML5?", points=10)
        AnswerOption.objects.create(question=q1_q5, option_text="<h1>", is_correct=True)
        AnswerOption.objects.create(question=q1_q5, option_text="<title>", is_correct=False)
        AnswerOption.objects.create(question=q1_q5, option_text="<header>", is_correct=False)

        # Create Project 1
        Project.objects.create(
            module=m1,
            title="Semantic Landing Page",
            description="Instructions:\nWrite a complete HTML5 landing page. It must contain:\n1. A <header> block with a <h1> site logo.\n2. A <nav> bar with at least 3 anchor links.\n3. An <article> detailing your bio.\n4. A <footer> with a copyright statement.",
            starter_code="<!-- Write your semantic Portfolio page here -->\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Portfolio</title>\n  </head>\n  <body>\n    <!-- Write code here -->\n  </body>\n</html>"
        )

        # Module 2
        m2 = Module.objects.create(course=c1, title="CSS3 Flexbox & Grid Layouts", order=2)
        lesson4 = Lesson.objects.create(
            module=m2,
            title="Selectors, Specificity & Box Model",
            description="Learn about the CSS Cascade rules, padding, margins, borders, box-sizing border-box, and specificity calculations.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=1
        )
        self._attach_lesson_document(lesson4, 'css_selectors_and_box_model.txt', 'This lesson document explains CSS selectors, inheritance, specificity, and the box model.')

        lesson5 = Lesson.objects.create(
            module=m2,
            title="Mastering Flexbox Alignment",
            description="Learn how to dynamically align children containers horizontally and vertically using flex-direction, justify-content, and align-items.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=2
        )
        self._attach_lesson_document(lesson5, 'flexbox_alignment.txt', 'This lesson document covers flexbox layout, justification, alignment, and practical layout examples.')
        
        q2 = Quiz.objects.create(module=m2, title="CSS Styling Quiz", passing_score=70)
        q2_q1 = Question.objects.create(quiz=q2, question_text="What is the default box-sizing rule in browsers?", points=10)
        AnswerOption.objects.create(question=q2_q1, option_text="content-box", is_correct=True)
        AnswerOption.objects.create(question=q2_q1, option_text="border-box", is_correct=False)

        q2_q2 = Question.objects.create(quiz=q2, question_text="Which CSS property controls horizontal alignment in a flex container?", points=10)
        AnswerOption.objects.create(question=q2_q2, option_text="justify-content", is_correct=True)
        AnswerOption.objects.create(question=q2_q2, option_text="align-items", is_correct=False)
        AnswerOption.objects.create(question=q2_q2, option_text="display", is_correct=False)

        q2_q3 = Question.objects.create(quiz=q2, question_text="What value of display creates a grid container?", points=10)
        AnswerOption.objects.create(question=q2_q3, option_text="grid", is_correct=True)
        AnswerOption.objects.create(question=q2_q3, option_text="flex", is_correct=False)
        AnswerOption.objects.create(question=q2_q3, option_text="block", is_correct=False)

        q2_q4 = Question.objects.create(quiz=q2, question_text="Which property determines the space between flex items?", points=10)
        AnswerOption.objects.create(question=q2_q4, option_text="gap", is_correct=True)
        AnswerOption.objects.create(question=q2_q4, option_text="margin", is_correct=False)
        AnswerOption.objects.create(question=q2_q4, option_text="padding", is_correct=False)

        q2_q5 = Question.objects.create(quiz=q2, question_text="Which property allows grid items to span multiple columns?", points=10)
        AnswerOption.objects.create(question=q2_q5, option_text="grid-column", is_correct=True)
        AnswerOption.objects.create(question=q2_q5, option_text="column-span", is_correct=False)
        AnswerOption.objects.create(question=q2_q5, option_text="grid-gap", is_correct=False)

        # =========================================================================
        # --- COURSE 2: Python ---
        # =========================================================================
        c2 = Course.objects.create(
            title="Python Programming Masterclass",
            description="Learn Python from absolute basics to advanced enterprise development. Master Object-Oriented Programming (OOP), file I/O, package managers, and script automation.",
            price=29.99,
            mentor=mentor,
            category=Course.Categories.TECH,
            status=Course.Status.PUBLISHED
        )
        
        # Module 1
        m2_1 = Module.objects.create(course=c2, title="Variables & Dynamic Data Types", order=1)
        lesson6 = Lesson.objects.create(
            module=m2_1,
            title="Python Syntax, Comments & Variables",
            description="Introduction to indentation rules, print formatting, naming variables, and reading command-line inputs.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=1
        )
        self._attach_lesson_document(lesson6, 'python_syntax_comments.txt', 'This lesson document introduces Python syntax rules, comments, variable naming, and basic input/output operations.')
        
        q2_1 = Quiz.objects.create(module=m2_1, title="Python Core Basics Quiz", passing_score=70)
        q2_1_q1 = Question.objects.create(quiz=q2_1, question_text="Which of the following data types is immutable in Python?", points=10)
        AnswerOption.objects.create(question=q2_1_q1, option_text="Tuple", is_correct=True)
        AnswerOption.objects.create(question=q2_1_q1, option_text="List", is_correct=False)

        q2_1_q2 = Question.objects.create(quiz=q2_1, question_text="What keyword is used to define a function in Python?", points=10)
        AnswerOption.objects.create(question=q2_1_q2, option_text="def", is_correct=True)
        AnswerOption.objects.create(question=q2_1_q2, option_text="func", is_correct=False)
        AnswerOption.objects.create(question=q2_1_q2, option_text="function", is_correct=False)

        q2_1_q3 = Question.objects.create(quiz=q2_1, question_text="How do you start a comment in Python?", points=10)
        AnswerOption.objects.create(question=q2_1_q3, option_text="#", is_correct=True)
        AnswerOption.objects.create(question=q2_1_q3, option_text="//", is_correct=False)
        AnswerOption.objects.create(question=q2_1_q3, option_text="/*", is_correct=False)

        q2_1_q4 = Question.objects.create(quiz=q2_1, question_text="Which symbol is used for exponentiation in Python?", points=10)
        AnswerOption.objects.create(question=q2_1_q4, option_text="**", is_correct=True)
        AnswerOption.objects.create(question=q2_1_q4, option_text="^", is_correct=False)
        AnswerOption.objects.create(question=q2_1_q4, option_text="%", is_correct=False)

        q2_1_q5 = Question.objects.create(quiz=q2_1, question_text="What is the output type of the input() function in Python?", points=10)
        AnswerOption.objects.create(question=q2_1_q5, option_text="str", is_correct=True)
        AnswerOption.objects.create(question=q2_1_q5, option_text="int", is_correct=False)
        AnswerOption.objects.create(question=q2_1_q5, option_text="bool", is_correct=False)

        # =========================================================================
        # --- COURSE 3: Data Science with Python ---
        # =========================================================================
        c3 = Course.objects.create(
            title="Data Science with Python",
            description="Learn how to analyze data, build visualizations, and prepare real datasets using Python libraries like pandas and matplotlib.",
            price=24.99,
            mentor=mentor,
            category=Course.Categories.TECH,
            status=Course.Status.PUBLISHED
        )

        m3_1 = Module.objects.create(course=c3, title="Data Analysis Fundamentals", order=1)
        lesson7 = Lesson.objects.create(
            module=m3_1,
            title="Working with pandas DataFrames",
            description="Understand how to load, filter, group, and summarize tabular data with pandas.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=1
        )
        self._attach_lesson_document(lesson7, 'pandas_dataframes.txt', 'This lesson document explains pandas DataFrames, series operations, indexing, and aggregations.')

        lesson8 = Lesson.objects.create(
            module=m3_1,
            title="Cleaning & Preparing Data",
            description="Learn how to detect missing values, normalize columns, and prepare data for analysis with Python.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=2
        )
        self._attach_lesson_document(lesson8, 'data_cleaning.txt', 'This lesson document covers data cleaning techniques such as dropna, fillna, type conversion, and formatting data for analytics.')

        q3 = Quiz.objects.create(module=m3_1, title="Pandas and Cleaning Quiz", passing_score=70)
        q3_q1 = Question.objects.create(quiz=q3, question_text="Which pandas method replaces missing values with a specified value?", points=10)
        AnswerOption.objects.create(question=q3_q1, option_text="fillna()", is_correct=True)
        AnswerOption.objects.create(question=q3_q1, option_text="dropna()", is_correct=False)

        q3_q2 = Question.objects.create(quiz=q3, question_text="Which pandas method removes rows with missing values?", points=10)
        AnswerOption.objects.create(question=q3_q2, option_text="dropna()", is_correct=True)
        AnswerOption.objects.create(question=q3_q2, option_text="fillna()", is_correct=False)
        AnswerOption.objects.create(question=q3_q2, option_text="replace()", is_correct=False)

        q3_q3 = Question.objects.create(quiz=q3, question_text="What does DataFrame.describe() return?", points=10)
        AnswerOption.objects.create(question=q3_q3, option_text="Summary statistics for numeric columns", is_correct=True)
        AnswerOption.objects.create(question=q3_q3, option_text="A list of column names", is_correct=False)
        AnswerOption.objects.create(question=q3_q3, option_text="A chart of values", is_correct=False)

        q3_q4 = Question.objects.create(quiz=q3, question_text="How do you select a column named 'age' from a pandas DataFrame df?", points=10)
        AnswerOption.objects.create(question=q3_q4, option_text="df['age']", is_correct=True)
        AnswerOption.objects.create(question=q3_q4, option_text="df.age()", is_correct=False)
        AnswerOption.objects.create(question=q3_q4, option_text="df.select('age')", is_correct=False)

        q3_q5 = Question.objects.create(quiz=q3, question_text="Which method converts a dictionary to a pandas DataFrame?", points=10)
        AnswerOption.objects.create(question=q3_q5, option_text="pd.DataFrame(dict_data)", is_correct=True)
        AnswerOption.objects.create(question=q3_q5, option_text="pd.Series(dict_data)", is_correct=False)
        AnswerOption.objects.create(question=q3_q5, option_text="pd.read_csv(dict_data)", is_correct=False)

        m3_2 = Module.objects.create(course=c3, title="Data Visualization", order=2)
        lesson9 = Lesson.objects.create(
            module=m3_2,
            title="Charting with Matplotlib",
            description="Create line plots, bar charts, scatter plots, and customize visuals for clear insights.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=1
        )
        self._attach_lesson_document(lesson9, 'matplotlib_visuals.txt', 'This lesson document shows how to build charts with matplotlib and customize axes, legends, and plot styles.')

        lesson10 = Lesson.objects.create(
            module=m3_2,
            title="Storytelling with Data",
            description="Learn visual storytelling best practices and how to present your findings with clear charts.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=2
        )
        self._attach_lesson_document(lesson10, 'data_storytelling.txt', 'This lesson document teaches how to choose the right chart type and create compelling visual narratives.')

        # =========================================================================
        # --- COURSE 4: React Frontend Development ---
        # =========================================================================
        c4 = Course.objects.create(
            title="React Frontend Development",
            description="Build modern, responsive web apps with React, routing, component architecture, and state management.",
            price=24.99,
            mentor=mentor,
            category=Course.Categories.TECH,
            status=Course.Status.PUBLISHED
        )

        m4_1 = Module.objects.create(course=c4, title="React Basics", order=1)
        lesson11 = Lesson.objects.create(
            module=m4_1,
            title="JSX, Components & Props",
            description="Learn the fundamentals of React components, JSX syntax, and passing data through props.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=1
        )
        self._attach_lesson_document(lesson11, 'react_jsx_components.txt', 'This lesson document explains JSX, functional components, props, and component composition in React.')

        lesson12 = Lesson.objects.create(
            module=m4_1,
            title="State and Lifecycle",
            description="Understand component state, hooks, and lifecycle behavior in React applications.",
            content_type=Lesson.ContentTypes.DOCUMENT,
            order=2
        )
        self._attach_lesson_document(lesson12, 'react_state_lifecycle.txt', 'This lesson document teaches useState, useEffect, and how React renders updates based on state changes.')

        q4 = Quiz.objects.create(module=m4_1, title="React Fundamentals Quiz", passing_score=70)
        q4_q1 = Question.objects.create(quiz=q4, question_text="Which hook is used to manage component state in React?", points=10)
        AnswerOption.objects.create(question=q4_q1, option_text="useState", is_correct=True)
        AnswerOption.objects.create(question=q4_q1, option_text="useEffect", is_correct=False)

        q4_q2 = Question.objects.create(quiz=q4, question_text="Which hook runs side effects after every render by default?", points=10)
        AnswerOption.objects.create(question=q4_q2, option_text="useEffect", is_correct=True)
        AnswerOption.objects.create(question=q4_q2, option_text="useMemo", is_correct=False)
        AnswerOption.objects.create(question=q4_q2, option_text="useState", is_correct=False)

        q4_q3 = Question.objects.create(quiz=q4, question_text="What JSX expression correctly renders a class name?", points=10)
        AnswerOption.objects.create(question=q4_q3, option_text="className=\"button\"", is_correct=True)
        AnswerOption.objects.create(question=q4_q3, option_text="class=\"button\"", is_correct=False)
        AnswerOption.objects.create(question=q4_q3, option_text="classname=\"button\"", is_correct=False)

        q4_q4 = Question.objects.create(quiz=q4, question_text="How do you create a functional component in React?", points=10)
        AnswerOption.objects.create(question=q4_q4, option_text="const MyComp = () => <div />", is_correct=True)
        AnswerOption.objects.create(question=q4_q4, option_text="function MyComp: <div />", is_correct=False)
        AnswerOption.objects.create(question=q4_q4, option_text="component MyComp = <div />", is_correct=False)

        q4_q5 = Question.objects.create(quiz=q4, question_text="Which hook returns a memoized value?", points=10)
        AnswerOption.objects.create(question=q4_q5, option_text="useMemo", is_correct=True)
        AnswerOption.objects.create(question=q4_q5, option_text="useEffect", is_correct=False)
        AnswerOption.objects.create(question=q4_q5, option_text="useCallback", is_correct=False)

        self.stdout.write(self.style.SUCCESS("Data seeded successfully with comprehensive, rich course content, badges and projects!"))
