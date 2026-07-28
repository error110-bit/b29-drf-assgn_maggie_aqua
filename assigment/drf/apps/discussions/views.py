from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Discussion_Thread, Comment
from .serializers import DiscussionThreadSerializer, CommentSerializer
from apps.users.permissions import IsClientReadOnly
from apps.notifications.services import notify_comment_created
from apps.studios.access import accessible_studios

class DiscussionThreadViewSet(viewsets.ModelViewSet):
    serializer_class = DiscussionThreadSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['stage']
    permission_classes = [IsClientReadOnly]

    def get_queryset(self):
        return Discussion_Thread.objects.filter(
            stage__project__studio__in=accessible_studios(self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['thread']
    permission_classes = [IsClientReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(
            thread__stage__project__studio__in=accessible_studios(self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        comment = serializer.save(user=self.request.user)
        notify_comment_created(comment, self.request.user)
