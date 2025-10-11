import random
from datetime import datetime, timedelta
import smtplib
from email.message import EmailMessage
from django.conf import settings
from django.utils import timezone
from .models import OTP

# Configuration
SENDER_EMAIL = "pateldhruv8404@gmail.com"   # replace with your Gmail
APP_PASSWORD = "gdkxpyipsqzhhzex"       # your Gmail app password

def generate_otp(length=6):
    """Generate a random numeric OTP."""
    return ''.join(str(random.randint(0, 9)) for _ in range(length))

def send_otp_email(email):
    """Send OTP to the specified email address."""
    otp = generate_otp()
    expiry = timezone.now() + timedelta(minutes=5)

    # Save OTP to DB
    OTP.objects.filter(email=email).delete()  # Remove old OTPs for this email
    otp_obj = OTP.objects.create(email=email, otp=otp, expires_at=expiry)

    msg = EmailMessage()
    msg['Subject'] = "Your OTP Code"
    msg['From'] = SENDER_EMAIL
    msg['To'] = email
    msg.set_content(f"""
Hello,

Your OTP is: {otp}

It will expire in 5 minutes.

Best regards,
Your OTP Verification System
""")

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.send_message(msg)

        print(f"✅ OTP sent successfully to {email}: {otp}")
        return True, "OTP sent successfully."
    except Exception as e:
        otp_obj.delete()  # Clean up if sending failed
        print(f"❌ Error sending email: {e}")
        return False, f"Error sending email: {str(e)}"

def verify_otp(email, entered_otp):
    """Verify the entered OTP."""
    try:
        otp_obj = OTP.objects.filter(email=email).latest('created_at')
        if otp_obj.is_expired():
            otp_obj.delete()
            return False, "OTP expired."
        if otp_obj.otp != entered_otp:
            return False, "Invalid OTP."
        otp_obj.delete()  # Remove after successful verification
        return True, "OTP verified successfully."
    except OTP.DoesNotExist:
        return False, "No OTP found for this email."
