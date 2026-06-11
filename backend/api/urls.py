from django.urls import path

from . import views

urlpatterns = [
    path("fonts/", views.fonts, name="fonts"),
    path("text/", views.text_art, name="text-art"),
    path("image/", views.image_art, name="image-art"),
]
