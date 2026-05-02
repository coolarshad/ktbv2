import os
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('GENERAL', 'General'),
        ('PERSONAL', 'Personal'),
    )

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='actions')
    verb = models.CharField(_("Verb or Title"), max_length=150)
    message = models.TextField(_("Notification Message"))
    target_url = models.CharField(_("Target Route URL"), max_length=255, null=True, blank=True)
    
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='PERSONAL')
    is_read = models.BooleanField(default=False)
    email_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')

    def __str__(self):
        return f"{self.recipient} - {self.verb} ({'Read' if self.is_read else 'Unread'})"
