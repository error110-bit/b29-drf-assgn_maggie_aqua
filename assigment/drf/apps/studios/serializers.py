from rest_framework import serializers
from apps.studios.models import Studio, StudioMembership


class StudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ['id', 'name', 'description', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class StudioMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioMembership
        fields = ['id', 'user', 'studio', 'role', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'user': {'required': False},
            'role': {'required': False},
        }
