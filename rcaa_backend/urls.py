from django.contrib import admin
from django.urls import path, include, re_path
from permits.views import serve_document_view

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("permits.urls")),
    re_path(r"^media/(?P<path>.*)$", serve_document_view, name="serve_document"),
]
