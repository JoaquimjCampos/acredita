from rest_framework.permissions import BasePermission
from rest_framework.request import Request
import logging

logger = logging.getLogger('acredita.quiz')


class QuizPermissionHelper:
    """Utilitários para permissões de Quiz"""

    @staticmethod
    def get_client_ip(request: Request) -> str:
        """Extrai o IP real do cliente considerando proxies"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    @staticmethod
    def is_bot(request: Request) -> bool:
        """Detecta se é um bot/crawler"""
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        bot_keywords = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget']
        return any(keyword in user_agent for keyword in bot_keywords)
