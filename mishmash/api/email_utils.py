import os
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Content, HtmlContent
from django.conf import settings

logger = logging.getLogger(__name__)

# Get settings from environment variables
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "SG.idk")
DEFAULT_FROM_EMAIL = os.getenv("SENDGRID_DEFAULT_FROM", "hccabroad@gmail.com")

# Get site branding for emails
def get_site_branding():
    try:
        from .models import SiteBranding
        branding = SiteBranding.objects.first()
        if branding:
            # Use relative URL path for the logo that will work in emails
            logo_url = f"/media/{branding.logo.name}" if branding.logo else "/images/logo.png"
            return {
                'site_name': branding.site_name,
                'primary_color': branding.primary_color,
                'logo_url': logo_url
            }
    except Exception as e:
        logger.error(f"Error fetching site branding: {str(e)}")
    
    # Return defaults if no branding is found or there was an error
    return {
        'site_name': 'Study Abroad College',
        'primary_color': '#1a237e',
        'logo_url': '/images/logo.png'
    }

def send_email(to_email, subject, html_content=None):
    """
    Send an email using SendGrid API
    
    Args:
        to_email (str): Recipient email address
        subject (str): Email subject line
        plain_text_content (str): Plain text version of email content
        html_content (str, optional): HTML version of email content. Defaults to None.
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    if not SENDGRID_API_KEY:
        logger.warning("SENDGRID_API_KEY not set. Email not sent.")
        print("SENDGRID_API_KEY not set. Email not sent.")
        return False
    
    message = Mail(
        from_email=DEFAULT_FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        html_content=html_content)
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"SendGrid status code: {response.status_code}")
        # Print the first 100 chars of the body for debugging
        print(f"Response body excerpt: {str(response.body)[:100]}")
        logger.info(f"Email sent to {to_email}, status code: {response.status_code}")
        return response.status_code >= 200 and response.status_code < 300
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        print(f"Error sending email: {str(e)}")
        
        # Add more detailed debugging
        print(f"API Key length: {len(SENDGRID_API_KEY)}")
        print(f"From email: {DEFAULT_FROM_EMAIL}")
        print(f"To email: {to_email}")
        
        return False

def send_recommendation_request_email(letter_obj, base_url):
    """
    Send email to recommendation letter writer with upload link
    
    Args:
        letter_obj: LetterOfRecommendation instance
        base_url (str): Base URL for the application (e.g., "https://studyabroad.example.com")
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    student_name = letter_obj.application.student.display_name
    program_title = letter_obj.application.program.title
    
    # Get site branding
    branding = get_site_branding()
    site_name = branding['site_name']
    primary_color = branding['primary_color']
    logo_url = f"{base_url}{branding['logo_url']}"
    
    # Build the unique URL with token for writer to upload letter
    upload_url = f"{base_url}/letters/{letter_obj.id}?token={letter_obj.token}"
    
    subject = f"Request for Letter of Recommendation - {student_name}"
    
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Letter of Recommendation Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif; background-color: #f5f5f5; color: #212121;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header with logo -->
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: {primary_color};">
                <img src="{logo_url}" alt="{site_name}" width="180" style="max-width: 80%;">
            </td>
        </tr>
        
        <!-- Main content -->
        <tr>
            <td style="padding: 30px 40px;">
                <h2 style="color: #1a237e; margin-top: 0; margin-bottom: 20px; font-weight: 600;">Letter of Recommendation Request</h2>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">Hello {letter_obj.writer_name},</p>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                    {student_name} is applying to the <strong>{program_title}</strong> study abroad program and has requested your recommendation.
                </p>
                
                <div style="background-color: #e8f5e9; border-left: 4px solid #2e7d32; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                        Please submit your letter of recommendation by clicking the button below:
                    </p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="{upload_url}" style="display: inline-block; background-color: #0277bd; color: #ffffff; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-size: 16px;">Upload Recommendation Letter</a>
                    </div>
                    <p style="font-size: 14px; color: #616161; margin: 10px 0 0 0;">
                        This link contains a unique token that allows you to securely upload your letter without needing to create an account.
                    </p>
                </div>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                    Thank you for your assistance!
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 5px;">
                    Best regards,
                </p>
                <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">
                    <strong>{site_name}</strong>
                </p>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="padding: 20px 40px; background-color: #f5f5f5; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 14px; color: #757575; margin: 0;">
                    &copy; 2025 {site_name}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    return send_email(letter_obj.writer_email, subject, html_content)

def send_recommendation_retraction_email(letter_obj):
    """
    Send email to recommendation letter writer when request is retracted
    
    Args:
        letter_obj: LetterOfRecommendation instance
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    student_name = letter_obj.application.student.display_name
    program_title = letter_obj.application.program.title
    
    # Get the base URL from the request context or use a default
    # This is needed because we don't have base_url passed to this function
    base_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Get site branding
    branding = get_site_branding()
    site_name = branding['site_name']
    primary_color = branding['primary_color']
    logo_url = f"{base_url}{branding['logo_url']}"
    
    subject = f"Letter of Recommendation Request Retracted - {student_name}"
    
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Letter of Recommendation Request Retracted</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif; background-color: #f5f5f5; color: #212121;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header with logo -->
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: {primary_color};">
                <img src="{logo_url}" alt="{site_name}" width="180" style="max-width: 80%;">
            </td>
        </tr>
        
        <!-- Main content -->
        <tr>
            <td style="padding: 30px 40px;">
                <h2 style="color: #1a237e; margin-top: 0; margin-bottom: 20px; font-weight: 600;">Letter Request Retracted</h2>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">Hello {letter_obj.writer_name},</p>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                    We want to inform you that {student_name} has retracted their request for a letter of recommendation for the <strong>{program_title}</strong> study abroad program.
                </p>
                
                <div style="background-color: #fff3e0; border-left: 4px solid #f57c00; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0;">
                        The previously sent link is no longer valid. You do not need to take any further action.
                    </p>
                </div>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                    Thank you for your understanding.
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 5px;">
                    Best regards,
                </p>
                <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">
                    <strong>{site_name}</strong>
                </p>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="padding: 20px 40px; background-color: #f5f5f5; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 14px; color: #757575; margin: 0;">
                    &copy; 2025 {site_name}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    return send_email(letter_obj.writer_email, subject, html_content)
