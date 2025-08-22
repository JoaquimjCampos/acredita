
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, AnswerViewSet, GameSessionViewSet, UserAnswerViewSet

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'answers', AnswerViewSet)
router.register(r'sessions', GameSessionViewSet)
router.register(r'user-answers', UserAnswerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
