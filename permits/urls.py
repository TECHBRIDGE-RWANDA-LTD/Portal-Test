from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    LoginView,
    CurrentUserView,
    ClearanceRequestViewSet,
    RespondClearanceView,
    ClearanceStatsView,
    DocumentUploadView
)

router = DefaultRouter()
router.register(r'permits', ClearanceRequestViewSet, basename='clearance-request')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('permits/<int:pk>/respond/', RespondClearanceView.as_view(), name='respond-permit'),
    path('upload-document/', DocumentUploadView.as_view(), name='upload-document'),
    path('stats/', ClearanceStatsView.as_view(), name='clearance-stats'),
    path('', include(router.urls)),
]
