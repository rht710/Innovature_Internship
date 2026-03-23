from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

class RoleBasedAccessMiddleware:
    """
    Middleware that restricts access to endpoints starting with /api/admin/
    to users with the 'admin' role in their UserProfile.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/demo-admin/'):
            jwt_authenticator = JWTAuthentication()
            try:
                auth_result = jwt_authenticator.authenticate(request)
                if auth_result is None:
                    return JsonResponse({'error': 'Authentication credentials were not provided.'}, status=401)
                
                user, token = auth_result
                
                # Check for profile and admin role
                if not hasattr(user, 'profile') or user.profile.role != 'admin':
                    return JsonResponse({'error': 'Forbidden: Admin access required.'}, status=403)
                    
            except (InvalidToken, AuthenticationFailed) as e:
                return JsonResponse({'error': str(e)}, status=401)

        response = self.get_response(request)
        return response
