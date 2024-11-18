import uuid
from django.db import models
from user_auth.models import User

class ChatRoom(models.Model):
    hash_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    name = models.CharField(max_length=255)
    users = models.ManyToManyField(User, related_name='rooms_joined', blank=True)

    def __str__(self):
        return self.name