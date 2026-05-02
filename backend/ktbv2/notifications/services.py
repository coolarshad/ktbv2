from .models import Notification
from .tasks import send_notification_email_task, spawn_general_notifications_task
from accounts.models import CustomUser

class NotificationService:
    @staticmethod
    def notify_users_explicit(actor, notified_user_ids, verb, message, target_url=None):
        if not notified_user_ids:
            return
            
        users = CustomUser.objects.filter(id__in=notified_user_ids, is_active=True).exclude(id=actor.id if actor else None)
        
        notifications = []
        emails = []
        for user in users:
            notifications.append(
                Notification(
                    recipient=user,
                    actor=actor,
                    verb=verb,
                    message=message,
                    target_url=target_url,
                    notification_type='PERSONAL',
                    email_sent=bool(user.email)
                )
            )
            if user.email:
                emails.append(user.email)
                
        if notifications:
            Notification.objects.bulk_create(notifications)
            
        if emails:
            send_notification_email_task.delay(
                subject=f"Action Required: {verb}", 
                body=message, 
                recipient_emails=emails
            )

    @staticmethod
    def notify_all_general(actor, verb, message, target_url=None):
        # Offload this to celery so the API doesn't wait to construct hundreds of objects
        actor_id = actor.id if actor else None
        spawn_general_notifications_task.delay(actor_id, verb, message, target_url)

