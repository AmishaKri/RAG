import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_welcome_email(to_email: str, user_name: str):

    message = MIMEMultipart("alternative")
    message["Subject"] = "Welcome to Our Platform!"
    message["From"] = settings.MAIL_FROM
    message["To"] = to_email

    html_content = f"""
    <html>
        <body>
            <h2>Hi {user_name},</h2>
            <p>Welcome! Your account has been registered successfully.</p>
        </body>
    </html>
    """
    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, to_email, message.as_string())
    except Exception as e:
        print(f"Error sending email: {e}")


def send_password_reset_email(to_email: str, token: str):
    # Frontend reset page  URL
    reset_url = f"https://yourfrontend.com/reset-password?token={token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Password Reset Request"
    message["From"] = settings.MAIL_FROM
    message["To"] = to_email

    html_content = f"""
    <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <p><a href="{reset_url}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>Or use this token directly: <code>{token}</code></p>
            <p>This link is valid for 15 minutes. If you did not request this, please ignore this email.</p>
        </body>
    </html>
    """
    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, to_email, message.as_string())
    except Exception as e:
        print(f"Error sending password reset email: {e}")