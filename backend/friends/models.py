from django.db import models
from user_auth.models import User

class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='from_user', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='to_user', on_delete=models.CASCADE)
    
    def send_friend_request(self, to_user):
        if isinstance(to_user, User) and not FriendRequest.objects.filter(from_user=self.from_user, to_user=to_user).exists():
            FriendRequest.objects.create(from_user=self.from_user, to_user=to_user)
            return True
        return False

    def accept_friend_request(self):
        if FriendRequest.objects.filter(from_user=self.from_user, to_user=self.to_user).exists():
            self.to_user.friends.add(self.from_user)
            self.from_user.friends.add(self.to_user)
            FriendRequest.objects.filter(from_user=self.from_user, to_user=self.to_user).delete()
            return True
        return False

    def list_friends(self):
        return self.to_user.friends.all()