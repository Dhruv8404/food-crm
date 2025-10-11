import smtplib
import random
from email.message import EmailMessage
from datetime import datetime, timedelta

# ===============================
# CONFIGURATION
# ===============================
SENDER_EMAIL = "pateldhruv8404@gmail.com"   # replace with your Gmail
APP_PASSWORD = "gdkxpyipsqzhhzex"       # your Gmail app password (no spaces)

# Store OTPs temporarily (in-memory dictionary)
otp_store = {}

def generate_otp(length=6):
    """Generate a random numeric OTP."""
    return ''.join(str(random.randint(0, 9)) for _ in range(length))

def send_otp_email(receiver_email):
    """Send OTP to the specified email address."""
    otp = generate_otp()
    expiry = datetime.now() + timedelta(minutes=5)

    msg = EmailMessage()
    msg['Subject'] = "Your OTP Code"
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver_email
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

        otp_store[receiver_email] = {"otp": otp, "expires_at": expiry}
        print(f"✅ OTP sent successfully to {receiver_email}")
    except Exception as e:
        print(f"❌ Error sending email: {e}")

def verify_otp(receiver_email, entered_otp):
    """Verify the entered OTP."""
    if receiver_email not in otp_store:
        return False, "No OTP sent to this email."

    record = otp_store[receiver_email]

    if datetime.now() > record["expires_at"]:
        del otp_store[receiver_email]
        return False, "OTP expired."

    if record["otp"] != entered_otp:
        return False, "Invalid OTP."

    # OTP verified successfully
    del otp_store[receiver_email]
    return True, "OTP verified successfully."

# ===============================
# TEST THE SYSTEM
# ===============================
if __name__ == "__main__":
    print("==== OTP EMAIL SYSTEM ====")
    email = input("Enter receiver email: ").strip()
    send_otp_email(email)

    otp_input = input("Enter the OTP you received: ").strip()
    success, message = verify_otp(email, otp_input)
    print(message)
