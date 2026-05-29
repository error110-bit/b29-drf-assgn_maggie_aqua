from django.urls import path
from .views import UserRegistrationView, CurrentUserView, UserListView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('user/', CurrentUserView.as_view(), name='current-user'),
    path('list/', UserListView.as_view(), name='user-list'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh')
]

# //http://127.0.0.1:8000/api/user/register
