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
        extra_kwargs = {
            'pilot_in_command': {'required': False, 'allow_null': True, 'allow_blank': True},
            'first_officer': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

    def to_internal_value(self, data):
        ret = super().to_internal_value(data)
        if ret.get('pilot_in_command') is None:
            ret['pilot_in_command'] = ''
        if ret.get('first_officer') is None:
            ret['first_officer'] = ''
        return ret

    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except Exception:
            # Safely pop extended fields if the server's database table is missing new columns
            extended_fields = [
                'payment_mode', 'payment_account_ref', 'billing_name', 'billing_address',
                'billing_city_country', 'billing_email', 'billing_tax_id',
                'passenger_manifest_summary', 'departure_airport', 'arrival_airport',
                'stopover_airport', 'stopover_purpose', 'airway_routes',
                'uploaded_airworthiness_cert', 'uploaded_aoc_cert', 'uploaded_insurance_cert'
            ]
            for field in extended_fields:
                validated_data.pop(field, None)
            return super().create(validated_data)

    def update(self, instance, validated_data):
        try:
            return super().update(instance, validated_data)
        except Exception:
            extended_fields = [
                'payment_mode', 'payment_account_ref', 'billing_name', 'billing_address',
                'billing_city_country', 'billing_email', 'billing_tax_id',
                'passenger_manifest_summary', 'departure_airport', 'arrival_airport',
                'stopover_airport', 'stopover_purpose', 'airway_routes',
                'uploaded_airworthiness_cert', 'uploaded_aoc_cert', 'uploaded_insurance_cert'
            ]
            for field in extended_fields:
                validated_data.pop(field, None)
            return super().update(instance, validated_data)

class StatusResponseSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ClearanceRequest.STATUS_CHOICES)
    response_notes = serializers.CharField(required=False, allow_blank=True)
    issued_permit_code = serializers.CharField(required=False, allow_blank=True)
    attached_document_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    attached_document_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
