from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import ClearanceRequest

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials. Please check username and password.")
        return {'user': user}

class ClearanceRequestSerializer(serializers.ModelSerializer):
    submitted_by_user = UserSerializer(source='submitted_by', read_only=True)

    class Meta:
        model = ClearanceRequest
        fields = '__all__'
        read_only_fields = ('reference_number', 'created_at', 'updated_at')

class StatusResponseSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ClearanceRequest.STATUS_CHOICES)
    response_notes = serializers.CharField(required=False, allow_blank=True)
    issued_permit_code = serializers.CharField(required=False, allow_blank=True)
    attached_document_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    attached_document_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
