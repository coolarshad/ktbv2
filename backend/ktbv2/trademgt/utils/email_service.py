# utils/email_utils.py
from django.core.mail import EmailMessage
from django.conf import settings
import threading

class EmailThread(threading.Thread):
    def __init__(self, subject, body, to_emails, html=False):
        self.subject = subject
        self.body = body
        self.to_emails = to_emails
        self.html = html
        threading.Thread.__init__(self)

    def run(self):
        email = EmailMessage(
            subject=self.subject,
            body=self.body,
            from_email=settings.EMAIL_HOST_USER,
            to=self.to_emails
        )
        if self.html:
            email.content_subtype = 'html'
        email.send(fail_silently=False)

def send_async_email(subject, body, to_emails, html=False):
    EmailThread(subject, body, to_emails, html).start()
