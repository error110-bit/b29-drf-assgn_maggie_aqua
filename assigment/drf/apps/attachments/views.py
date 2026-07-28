from rest_framework import viewsets
from .models import Task_Attachment
from .serializers import TaskAttachmentSerializer
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.permissions import IsClientReadOnly
from apps.studios.access import accessible_studios

class TaskAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = TaskAttachmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task']
    permission_classes = [IsClientReadOnly]

    def get_queryset(self):
        return Task_Attachment.objects.filter(
            task__project__studio__in=accessible_studios(self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
