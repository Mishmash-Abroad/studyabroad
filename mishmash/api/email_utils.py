import os
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Content, HtmlContent
from django.conf import settings

logger = logging.getLogger(__name__)

# Get settings from environment variables
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "SG.idk")
DEFAULT_FROM_EMAIL = os.getenv("SENDGRID_DEFAULT_FROM", "hccabroad@gmail.com")

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
    
    # Build the unique URL with token for writer to upload letter
    upload_url = f"{base_url}/api/letters/{letter_obj.id}/public_info/?token={letter_obj.token}"
    
    subject = f"Request for Letter of Recommendation - {student_name}"
    
    html_content = f"""
<html>
<body>
    <p>Hello {letter_obj.writer_name},</p>
    <p>{student_name} is applying to the <strong>{program_title}</strong> study abroad program and has requested your recommendation.</p>
    <p>Please submit your letter of recommendation by clicking the link below:</p>
    <p><a href="{upload_url}">Upload your recommendation letter</a></p>
    <p>This link contains a unique token that allows you to securely upload your letter without needing to create an account.</p>
    <p>Thank you for your assistance!</p>
    <p>Best regards,<br>HCC Study Abroad Program</p>
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
    
    subject = f"Letter of Recommendation Request Retracted - {student_name}"
    
    html_content = f"""
<html>
<body>
    <p>Hello {letter_obj.writer_name},</p>
    <p>We want to inform you that {student_name} has retracted their request for a letter of recommendation for the <strong>{program_title}</strong> study abroad program.</p>
    <p>The previously sent link is no longer valid. You do not need to take any further action.</p>
    <p>Thank you for your understanding.</p>
    <p>Best regards,<br>HCC Study Abroad Program</p>
</body>
</html>
"""
    
    return send_email(letter_obj.writer_email, subject, html_content)
