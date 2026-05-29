from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Discussion_Thread, Comment
from .serializers import DiscussionThreadSerializer, CommentSerializer
from apps.users.permissions import IsClientReadOnly
from apps.notifications.services import notify_comment_created

class DiscussionThreadViewSet(viewsets.ModelViewSet):
    queryset = Discussion_Thread.objects.all()
    serializer_class = DiscussionThreadSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['stage']
    permission_classes = [IsClientReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['thread']
    permission_classes = [IsClientReadOnly]

    def perform_create(self, serializer):
        comment = serializer.save(user=self.request.user)
        notify_comment_created(comment, self.request.user)