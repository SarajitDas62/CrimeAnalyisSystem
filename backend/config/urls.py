from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Endpoints
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/crime/', include('apps.crime_data.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/prediction/', include('apps.prediction.urls')),
    
    # Frontend Pages (Server-rendered HTML templates utilizing JavaScript Fetch for APIs)
    path('', TemplateView.as_view(template_name="dashboard.html"), name="dashboard"),
    path('login/', TemplateView.as_view(template_name="login.html"), name="login"),
    path('register/', TemplateView.as_view(template_name="register.html"), name="register"),
    path('crime-management/', TemplateView.as_view(template_name="crime_management.html"), name="crime-management"),
    path('analytics/', TemplateView.as_view(template_name="analytics.html"), name="analytics"),
    path('prediction/', TemplateView.as_view(template_name="prediction.html"), name="prediction"),
    path('profile/', TemplateView.as_view(template_name="profile.html"), name="profile"),
    path('audit-logs/', TemplateView.as_view(template_name="audit_logs.html"), name="audit-logs"),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
