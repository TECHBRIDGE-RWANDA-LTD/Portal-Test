import random
import string
from django.db import models
from django.contrib.auth.models import User

def generate_reference_number():
    digits = ''.join(random.choices(string.digits, k=6))
    return f"RCAA-2026-{digits}"

class ClearanceRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Verification'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    reference_number = models.CharField(max_length=50, unique=True, default=generate_reference_number, editable=False)
    airline_operator = models.CharField(max_length=255)
    aircraft_registration = models.CharField(max_length=100)
    has_electronic_warfare = models.BooleanField(default=False)
    electronic_warfare_details = models.TextField(blank=True, null=True)
    has_aircraft_modifications = models.BooleanField(default=False)
    aircraft_modifications_details = models.TextField(blank=True, null=True)
    clearance_category = models.CharField(max_length=100, default='Overflight')
    clearance_type = models.CharField(max_length=100, default='Ad-Hoc')
    purpose_of_flight = models.TextField()
    aircraft_callsign = models.CharField(max_length=100)
    pilot_in_command = models.CharField(max_length=150)
    first_officer = models.CharField(max_length=150)
    entry_point = models.CharField(max_length=100, blank=True, null=True)
    exit_point = models.CharField(max_length=100, blank=True, null=True)
    flight_date = models.DateField(blank=True, null=True)
    passengers_count = models.IntegerField(default=0)
    cargo_details = models.TextField(blank=True, null=True)
    
    # Automation & Admin Action Fields
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')
    response_notes = models.TextField(blank=True, default='Clearance request submitted. Awaiting CAA verification.')
    issued_permit_code = models.CharField(max_length=100, blank=True, null=True)
    attached_document_name = models.CharField(max_length=255, blank=True, null=True)
    attached_document_url = models.TextField(blank=True, null=True)
    
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='clearance_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reference_number} - {self.airline_operator} ({self.aircraft_registration})"
