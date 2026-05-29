from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from apps.studios.models import Studio, StudioMembership
from apps.studios.serializers import StudioSerializer, StudioMembershipSerializer
from apps.users.permissions import IsAdmin


class StudioViewSet(viewsets.ModelViewSet):
    serializer_class = StudioSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Studio.objects.none()
        if user.role == 'admin':
            return Studio.objects.filter(created_by=user)
        studio_ids = StudioMembership.objects.filter(user=user).values_list('studio_id', flat=True)
        return Studio.objects.filter(id__in=studio_ids).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class StudioMembershipViewSet(viewsets.ModelViewSet):
    serializer_class = StudioMembershipSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['studio']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return StudioMembership.objects.none()
        if user.role == 'admin':
            return StudioMembership.objects.filter(studio__created_by=user)
        return StudioMembership.objects.filter(user=user)

    def perform_create(self, serializer):
        target_user = serializer.validated_data.get('user', self.request.user)
        studio = serializer.validated_data['studio']
        if studio.created_by != self.request.user:
            raise PermissionDenied('You can only add people to studios you created.')

        if StudioMembership.objects.filter(user=target_user, studio=studio).exists():
            raise ValidationError({'detail': 'This user is already a member of this studio.'})

        role = serializer.validated_data.get('role') or self.get_membership_role(target_user)
        serializer.save(user=target_user, role=role)

    def get_membership_role(self, user):
        role_map = {
            'admin': 'ADMIN',
            'project_lead': 'PROJECT_LEAD',
            'designer': 'DESIGNER',
            'writer': 'WRITER',
            'reviewer': 'REVIEWER',
            'client': 'CLIENT_VIEWER',
        }
        return role_map.get(user.role, 'DESIGNER')



# Create your views here.
