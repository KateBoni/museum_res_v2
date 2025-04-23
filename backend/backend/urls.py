from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from api.views import CreateUserView, GoogleLoginView, MyTokenObtainPairView, send_qr_email
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    # path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path('accounts/', include("allauth.urls")),
    path("api/", include("api.urls")),
    path("api/auth/social/google/", GoogleLoginView.as_view(), name="google-login"),  
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/social/', include('allauth.socialaccount.urls')),
    path('send-qr-email/', send_qr_email, name='send_qr_email'),
    path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)