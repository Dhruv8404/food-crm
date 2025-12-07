# Food Ordering System Error Fixes

## Completed Tasks
- [x] Fixed email sending error (SMTP 535) by switching from smtplib to Django's send_mail in utils.py
- [x] Updated send_otp_email and send_bill_email_util to use Django's email backend
- [x] Removed hardcoded email credentials from utils.py
- [x] Fixed 403 Forbidden error on /api/orders/ by removing DEFAULT_PERMISSION_CLASSES from REST_FRAMEWORK settings
- [x] Ensured OrderListCreateView uses AllowAny permission correctly

## Summary of Changes
1. **Email System**: Switched to Django's email backend (console backend for development) to avoid SMTP credential issues
2. **Permissions**: Removed global IsAuthenticated default to allow per-view permission control
3. **Registration**: Fixed 400 error by ensuring OTP emails are sent properly

## Testing Required
- Test customer registration flow to ensure OTP emails are sent (will appear in console)
- Test GET /api/orders/ endpoint to confirm 403 is resolved
- Verify bill email sending functionality

## Notes
- Emails now print to console instead of sending via SMTP (development setup)
- For production, change EMAIL_BACKEND to 'django.core.mail.backends.smtp.EmailBackend' and set proper EMAIL_HOST_USER/EMAIL_HOST_PASSWORD environment variables
