import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger("scholarpulse.email")

def send_admin_registration_alert(user_name: str, user_email: str, user_role: str, user_interests: str):
    """
    Sends an immediate notification to the Admin whenever a new user registers on the platform.
    """
    admin_recipient = settings.ADMIN_NOTIFICATION_EMAIL or settings.SMTP_USERNAME
    if not admin_recipient or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.info(f"[Email Alert Simulated] New user registered: {user_name} ({user_email}, {user_role}). Configure SMTP in .env to receive live inbox emails.")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🎓 [ScholarPulse Alert] New User Registered: {user_name}"
        msg["From"] = f"ScholarPulse Platform <{settings.SMTP_USERNAME}>"
        msg["To"] = admin_recipient

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 18px; border-radius: 8px; color: white; text-align: center;">
                <h2 style="margin: 0; font-size: 20px;">🎓 ScholarPulse Platform Alert</h2>
                <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">New Researcher Registration Recorded</p>
            </div>
            
            <div style="padding: 20px 0;">
                <p style="font-size: 14px; color: #334155;">A new user has just registered on your ScholarPulse research instance:</p>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px; font-weight: bold; color: #64748b; width: 140px;">Full Name:</td>
                        <td style="padding: 8px; color: #0f172a; font-weight: 600;">{user_name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px; font-weight: bold; color: #64748b;">Email Address:</td>
                        <td style="padding: 8px; color: #2563eb; font-weight: 600;">{user_email}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px; font-weight: bold; color: #64748b;">Academic Role:</td>
                        <td style="padding: 8px; color: #0f172a;">{user_role}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold; color: #64748b;">Research Interests:</td>
                        <td style="padding: 8px; color: #0f172a;">{user_interests or 'Not specified'}</td>
                    </tr>
                </table>
                
                <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
                    This notification was generated automatically by your ScholarPulse backend database.
                </p>
            </div>
        </div>
        """

        msg.attach(MIMEText(html_content, "html"))

        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USERNAME, admin_recipient, msg.as_string())
        server.quit()
        logger.info(f"Admin registration alert successfully sent for {user_email}")
    except Exception as e:
        logger.warning(f"Could not send email alert (check SMTP credentials in .env): {e}")


def send_user_welcome_email(user_name: str, user_email: str):
    """
    Sends a clean welcome email to the newly registered user.
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Welcome to ScholarPulse — Your AI Research Workspace"
        msg["From"] = f"ScholarPulse <{settings.SMTP_USERNAME}>"
        msg["To"] = user_email

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 20px; border-radius: 8px; color: white; text-align: center;">
                <h2 style="margin: 0; font-size: 22px;">Welcome to ScholarPulse</h2>
                <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">AI-Powered Research Paper Digest & Literature Assistant</p>
            </div>
            
            <div style="padding: 24px 0; color: #334155; line-height: 1.6; font-size: 14px;">
                <p>Hello <strong>{user_name}</strong>,</p>
                <p>Your account has been successfully created. You now have full access to:</p>
                <ul>
                    <li><strong>AI Paper Reader:</strong> Instant summaries, methodology breakdowns, and quantitative metric extraction.</li>
                    <li><strong>Zero-Hallucination Q&A:</strong> Ask complex questions grounded with section and page citations.</li>
                    <li><strong>Literature Review & Gap Finder:</strong> Generate multi-paper reviews and find novel thesis opportunities.</li>
                    <li><strong>Citation Manager:</strong> Export formatted citations in APA, IEEE, MLA, Chicago, and BibTeX.</li>
                </ul>
                <p>Your login email is: <strong style="color: #2563eb;">{user_email}</strong></p>
                <p>Happy Researching!</p>
            </div>
        </div>
        """

        msg.attach(MIMEText(html_content, "html"))

        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USERNAME, user_email, msg.as_string())
        server.quit()
    except Exception as e:
        logger.warning(f"Could not send welcome email to {user_email}: {e}")
