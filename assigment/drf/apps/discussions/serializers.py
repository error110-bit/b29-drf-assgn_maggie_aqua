from rest_framework import serializers
from .models import Discussion_Thread, Comment
from apps.studios.access import user_can_access_studio_id


class StudioScopedSerializerMixin:
    def require_studio_access(self, studio_id):
        if not user_can_access_studio_id(self.context['request'].user, studio_id):
            raise serializers.ValidationError('The selected resource is not in your studio.')

class DiscussionThreadSerializer(StudioScopedSerializerMixin, serializers.ModelSerializer):
    def validate_stage(self, stage):
        self.require_studio_access(stage.project.studio_id)
        return stage
    class Meta:
        model = Discussion_Thread
        fields = ['id', 'stage', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by']

class CommentSerializer(StudioScopedSerializerMixin, serializers.ModelSerializer):
    def validate_thread(self, thread):
        self.require_studio_access(thread.stage.project.studio_id)
        return thread
    class Meta:
        model = Comment
        fields = ['id', 'thread', 'user', 'message', 'created_at', 'updated_at']
        read_only_fields = ['user']
