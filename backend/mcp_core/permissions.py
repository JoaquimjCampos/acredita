from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsMentorOrAdminOrReadOnly(BasePermission):
    """
    Allows read-only access to anyone authenticated; write access only to mentor/admin.
    If unauthenticated, denies all.
    """
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if request.method in SAFE_METHODS:
            return True
        if not user or not user.is_authenticated:
            return False
        user_type = getattr(user, 'user_type', None)
        return user_type in ('mentor', 'admin')
