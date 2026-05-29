from rest_framework import serializers
from .models import project, Task, Stage, projectMember, StageApproval


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = project
        fields = ['id', 'studio', 'title', 'description', 'created_by', 'lead_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by']


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'project', 'title', 'description', 'priority', 'deadline', 'stage', 'assigned_to', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by']


class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = ['id', 'project', 'stage', 'created_at', 'updated_at']


class ProjectMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = projectMember
        fields = ['id', 'project', 'user', 'role', 'created_at', 'updated_at']
        # FIX: user and role are set automatically in perform_create from request.user
        # Without read_only, DRF validates them as required request fields → 400 error
        read_only_fields = ['user', 'role']


class StageApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = StageApproval
        fields = ['id', 'stage', 'proposed_by', 'approved_by', 'status', 'created_at', 'updated_at']
        read_only_fields = ['proposed_by', 'approved_by', 'status']
