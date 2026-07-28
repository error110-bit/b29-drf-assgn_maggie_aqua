"""Shared helpers for enforcing the studio tenant boundary."""

from django.db import models

from apps.studios.models import Studio


def accessible_studios(user):
    """Return exactly the studios that *user* is allowed to access."""
    if not user or not user.is_authenticated:
        return Studio.objects.none()
    if user.role == 'admin':
        return Studio.objects.filter(created_by=user)
    return Studio.objects.filter(studiomembership__user=user).distinct()


def user_can_access_studio(user, studio):
    """Use this before accepting a studio-related foreign key from a request."""
    return accessible_studios(user).filter(pk=studio.pk).exists()


def user_can_access_studio_id(user, studio_id):
    return accessible_studios(user).filter(pk=studio_id).exists()


def is_studio_member_or_owner(user, studio_id):
    """Whether a user may be assigned work in this studio."""
    return Studio.objects.filter(
        pk=studio_id
    ).filter(
        models.Q(created_by=user) | models.Q(studiomembership__user=user)
    ).exists()
