from celery import shared_task
from django.core.mail import EmailMessage
from django.conf import settings
from .models import Notification
from accounts.models import CustomUser
import traceback

@shared_task
def send_notification_email_task(subject, body, recipient_emails):
    if not recipient_emails:
        return
    for recipient in recipient_emails:
        if not recipient or '@' not in recipient:
            continue
        # Avoid sending to obvious dummy development domains to save resources/prevent SMTP blocks
        if recipient.endswith('@xxxa.com') or recipient.endswith('@example.com'):
            print(f"Skipping email to dummy address: {recipient}")
            continue
        try:
            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=settings.EMAIL_HOST_USER,
                to=[recipient],
            )
            email.send()
            print(f"Successfully sent email to {recipient}")
        except Exception as e:
            print(f"Error sending email to {recipient}: {e}")
            traceback.print_exc()

@shared_task
def spawn_general_notifications_task(actor_id, verb, message, target_url=None):
    from accounts.models import CustomUser
    actor = CustomUser.objects.get(id=actor_id) if actor_id else None
    all_users = CustomUser.objects.filter(is_active=True).exclude(id=actor_id)
    
    notifications = []
    for user in all_users:
        notifications.append(
            Notification(
                recipient=user,
                actor=actor,
                verb=verb,
                message=message,
                target_url=target_url,
                notification_type='GENERAL',
                email_sent=bool(user.email)
            )
        )
    
    if notifications:
        Notification.objects.bulk_create(notifications)
        # Also email everyone for general notification
        emails = list(all_users.values_list('email', flat=True))
        send_notification_email_task.delay(
            subject=f"New Notification: {verb}", 
            body=message, 
            recipient_emails=emails
        )
