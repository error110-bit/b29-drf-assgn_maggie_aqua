from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from .models import project, Task, Stage, projectMember, StageApproval
from .serializers import (
    ProjectSerializer, TaskSerializer, StageSerializer,
    ProjectMemberSerializer, StageApprovalSerializer
)
from apps.users.permissions import IsProjectLeadorAdmin, IsClientReadOnly, IsReviewer
from apps.studios.models import StudioMembership
from apps.notifications.services import notify_task_assigned, notify_stage_approval_requested

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsProjectLeadorAdmin]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return project.objects.none()
        if user.role == 'admin':
            return project.objects.filter(studio__created_by=user)
        studio_ids = StudioMembership.objects.filter(user=user).values_list('studio_id', flat=True)
        return project.objects.filter(studio__in=studio_ids).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='move-stage')
    def move_stage(self, request, pk=None):
        project_obj = self.get_object()
        stage_name = request.data.get('stage')

        if not stage_name:
            return Response(
                {'detail': 'stage is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        valid_stages = [choice[0] for choice in Stage._meta.get_field('stage').choices]
        if stage_name not in valid_stages:
            return Response(
                {'detail': f'Invalid stage. Choose one of: {", ".join(valid_stages)}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        stage_obj, _ = Stage.objects.get_or_create(
            project=project_obj,
            stage=stage_name
        )
        return Response(StageSerializer(stage_obj).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='propose-stage')
    def propose_stage(self, request, pk=None):
        project_obj = self.get_object()
        stage_id = request.data.get('stage_id')

        if not stage_id:
            return Response(
                {'detail': 'stage_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            stage_obj = Stage.objects.get(id=stage_id, project=project_obj)
        except Stage.DoesNotExist:
            return Response(
                {'detail': 'Stage not found for this project.'},
                status=status.HTTP_404_NOT_FOUND
            )

        approval, created = StageApproval.objects.get_or_create(
            stage=stage_obj,
            status='PENDING',
            defaults={'proposed_by': request.user}
        )
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(StageApprovalSerializer(approval).data, status=response_status)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsClientReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['project', 'stage', 'assigned_to']
    search_fields = ['title', 'description']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Task.objects.none()
        if user.role == 'admin':
            return Task.objects.filter(project__studio__created_by=user)
        studio_ids = StudioMembership.objects.filter(user=user).values_list('studio_id', flat=True)
        return Task.objects.filter(project__studio__in=studio_ids).distinct()

    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)
        notify_task_assigned(task, self.request.user)


class StageViewSet(viewsets.ModelViewSet):
    serializer_class = StageSerializer
    permission_classes = [IsProjectLeadorAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Stage.objects.none()
        if user.role == 'admin':
            return Stage.objects.filter(project__studio__created_by=user)
        studio_ids = StudioMembership.objects.filter(user=user).values_list('studio_id', flat=True)
        return Stage.objects.filter(project__studio__in=studio_ids).distinct()


class ProjectMemberViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMemberSerializer
    # FIX: was IsProjectLeadorAdmin — blocked everyone except admin/lead.
    # Any authenticated user can now join a project.
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return projectMember.objects.none()
        if user.role == 'admin':
            return projectMember.objects.filter(project__studio__created_by=user)
        studio_ids = StudioMembership.objects.filter(user=user).values_list('studio_id', flat=True)
        return projectMember.objects.filter(project__studio__in=studio_ids).distinct()

    def create(self, request, *args, **kwargs):
        project_id = request.data.get('project')

        # Prevent duplicate membership
        if projectMember.objects.filter(user=request.user, project_id=project_id).exists():
            return Response(
                {'detail': 'You are already a member of this project.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Map User.role (lowercase) → projectMember role choices (uppercase)
        # These two systems used different casing — this bridges them.
        role_map = {
            'admin':        'ADMIN',
            'project_lead': 'PROJECT_LEAD',
            'designer':     'DESIGNER',
            'writer':       'WRITER',
            'reviewer':     'REVIEWER',
            'client':       'CLIENT_VIEWER',
        }
        role = role_map.get(self.request.user.role, 'DESIGNER')
        # Auto-set user from request — frontend only needs to send project ID
        serializer.save(user=self.request.user, role=role)


class StageApprovalViewSet(viewsets.ModelViewSet):
    serializer_class = StageApprovalSerializer
    permission_classes = [IsReviewer]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['stage']

    def get_queryset(self):
        return StageApproval.objects.all()

    def perform_create(self, serializer):
        stage_approval = serializer.save(proposed_by=self.request.user)
        notify_stage_approval_requested(stage_approval, self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        approval = self.get_object()
        approval.status = 'APPROVED'
        approval.approved_by = request.user
        approval.save(update_fields=['status', 'approved_by', 'updated_at'])
        return Response(StageApprovalSerializer(approval).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        approval = self.get_object()
        approval.status = 'REJECTED'
        approval.approved_by = request.user
        approval.save(update_fields=['status', 'approved_by', 'updated_at'])
        return Response(StageApprovalSerializer(approval).data)
