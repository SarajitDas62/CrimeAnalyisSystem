from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Allows access only to Admin users."""
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile.role == 'Admin'
        )


class IsAnalystOrAdminUser(permissions.BasePermission):
    """Allows access only to Analysts and Admin users."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role in ['Analyst', 'Admin']


class IsOfficerOrAboveUser(permissions.BasePermission):
    """Allows access to Officers, Analysts, and Admin users."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role in ['Officer', 'Analyst', 'Admin']
