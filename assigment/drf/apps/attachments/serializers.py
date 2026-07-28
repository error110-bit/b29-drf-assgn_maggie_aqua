from rest_framework import serializers
from .models import Task_Attachment
from apps.studios.access import user_can_access_studio_id

class TaskAttachmentSerializer(serializers.ModelSerializer):
    def validate_task(self, task):
        if not user_can_access_studio_id(self.context['request'].user, task.project.studio_id):
            raise serializers.ValidationError('The selected task is not in your studio.')
        return task
    class Meta:
        model = Task_Attachment
        fields = ['id', 'task', 'uploaded_by', 'description', 'file_url', 'created_at', 'updated_at']
        read_only_fields = ['uploaded_by']
