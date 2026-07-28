from rest_framework import serializers
from .models import project, Task, Stage, projectMember, StageApproval
from apps.studios.access import is_studio_member_or_owner, user_can_access_studio_id


class StudioScopedSerializerMixin:
    """Reject related records from another studio on create and update."""

    def require_studio_access(self, studio_id):
        request = self.context['request']
        if not user_can_access_studio_id(request.user, studio_id):
            raise serializers.ValidationError('The selected resource is not in your studio.')


class ProjectSerializer(StudioScopedSerializerMixin, serializers.ModelSerializer):
    def validate_studio(self, studio):
        self.require_studio_access(studio.id)
        return studio

    def validate(self, attrs):
        studio = attrs.get('studio', getattr(self.instance, 'studio', None))
        lead = attrs.get('lead_by', getattr(self.instance, 'lead_by', None))
        if studio and lead and not is_studio_member_or_owner(lead, studio.id):
            raise serializers.ValidationError(
                {'lead_by': 'The project lead must belong to this studio.'}
            )
        return attrs
    class Meta:
        model = project
        fields = ['id', 'studio', 'title', 'description', 'created_by', 'lead_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by']


class TaskSerializer(StudioScopedSerializerMixin, serializers.ModelSerializer):
    def validate(self, attrs):
        project_obj = attrs.get('project', getattr(self.instance, 'project', None))
        stage = attrs.get('stage', getattr(self.instance, 'stage', None))
        if project_obj:
            self.require_studio_access(project_obj.studio_id)
        if stage and stage.project_id != project_obj.id:
            raise serializers.ValidationError({'stage': 'The stage must belong to the selected project.'})
        assigned_to = attrs.get('assigned_to', getattr(self.instance, 'assigned_to', None))
        if project_obj and assigned_to and not is_studio_member_or_owner(
            assigned_to, project_obj.studio_id
        ):
            raise serializers.ValidationError(
                {'assigned_to': 'The assignee must belong to this studio.'}
            )
        return attrs
    class Meta:
        model = Task
        fields = ['id', 'project', 'title', 'description', 'priority', 'deadline', 'stage', 'assigned_to', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by']


class StageSerializer(StudioScopedSerializerMixin, serializers.ModelSerializer):
    def validate_project(self, project_obj):
        self.require_studio_access(project_obj.studio_id)
        return project_obj
    class Meta:
        model = Stage
        fields = ['id', 'project', 'stage', 'created_at', 'updated_at']


class ProjectMemberSerializer(StudioScopedSerializerMixin, serializers.ModelSerializer):
    def validate_project(self, project_obj):
        self.require_studio_access(project_obj.studio_id)
        return project_obj
    class Meta:
        model = projectMember
        fields = ['id', 'project', 'user', 'role', 'created_at', 'updated_at']
        # FIX: user and role are set automatically in perform_create from request.user
        # Without read_only, DRF validates them as required request fields → 400 error
        read_only_fields = ['user', 'role']


class StageApprovalSerializer(StudioScopedSerializerMixin, serializers.ModelSerializer):
    def validate_stage(self, stage):
        self.require_studio_access(stage.project.studio_id)
        return stage
    class Meta:
        model = StageApproval
        fields = ['id', 'stage', 'proposed_by', 'approved_by', 'status', 'created_at', 'updated_at']
        read_only_fields = ['proposed_by', 'approved_by', 'status']
