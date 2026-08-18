import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rcaa_backend.settings')
django.setup()

from django.contrib.auth.models import User
from permits.models import ClearanceRequest

def seed():
    # Create test user if not exists
    user, created = User.objects.get_or_create(
        username='automation_user',
        defaults={
            'email': 'automation@rcaa.gov.rw',
            'first_name': 'RCAA',
            'last_name': 'Automation Agent'
        }
    )
    if created:
        user.set_password('Password123!')
        user.save()
        print("Created automation_user with password Password123!")

    # Seed sample requests matching real flight agencies
    samples = [
        {
            'airline_operator': 'TANZANIA GOVERNMENT FLIGHT AGENCY.',
            'aircraft_registration': '5HONE',
            'has_electronic_warfare': False,
            'electronic_warfare_details': '',
            'has_aircraft_modifications': False,
            'aircraft_modifications_details': '',
            'clearance_category': 'Overflight',
            'clearance_type': 'Ad-Hoc',
            'purpose_of_flight': 'VVIP State Visit Transport',
            'aircraft_callsign': 'TGFA01',
            'pilot_in_command': 'Capt. Joseph Mukasa',
            'first_officer': 'F/O Sarah Hassan',
            'entry_point': 'OKIMO',
            'exit_point': 'VAKIS',
            'passengers_count': 12,
            'status': 'APPROVED',
            'issued_permit_code': 'PERMIT-RCAA-2026-TZ881',
            'response_notes': 'Ad-Hoc Overflight Clearance granted per Civil Aviation Regulations.'
        },
        {
            'airline_operator': 'RWANDAIR ',
            'aircraft_registration': '9XR-WN',
            'has_electronic_warfare': False,
            'electronic_warfare_details': '',
            'has_aircraft_modifications': True,
            'aircraft_modifications_details': 'Upgraded weather radar sensor suite',
            'clearance_category': 'Landing & Takeoff',
            'clearance_type': 'Ad-Hoc',
            'purpose_of_flight': 'Scheduled Commercial Passenger Transit',
            'aircraft_callsign': 'RWB402',
            'pilot_in_command': 'Capt. Emmanuel Rutayisire',
            'first_officer': 'F/O Claudine Uwamahoro',
            'entry_point': 'KGL',
            'exit_point': 'KGL',
            'passengers_count': 148,
            'status': 'PENDING',
            'response_notes': 'Request received and queued for RCAA verification processing.'
        },
        {
            'airline_operator': 'ETHIOPIAN AIRLINES CORP',
            'aircraft_registration': 'ET-AUO',
            'has_electronic_warfare': False,
            'electronic_warfare_details': '',
            'has_aircraft_modifications': False,
            'aircraft_modifications_details': '',
            'clearance_category': 'Overflight',
            'clearance_type': 'Ad-Hoc',
            'purpose_of_flight': 'Humanitarian Cargo Transport',
            'aircraft_callsign': 'ETH910',
            'pilot_in_command': 'Capt. Solomon Tekle',
            'first_officer': 'F/O Bethlehem Worku',
            'entry_point': 'BUJ',
            'exit_point': 'NBO',
            'passengers_count': 4,
            'cargo_details': 'Medical supplies & equipment (25 Tons)',
            'status': 'UNDER_REVIEW',
            'response_notes': 'Under review by Air Navigation Services Directorate.'
        }
    ]

    for data in samples:
        obj, c = ClearanceRequest.objects.get_or_create(
            aircraft_registration=data['aircraft_registration'],
            aircraft_callsign=data['aircraft_callsign'],
            defaults={**data, 'submitted_by': user}
        )
        if c:
            print(f"Seeded request: {obj.reference_number}")

if __name__ == '__main__':
    seed()
