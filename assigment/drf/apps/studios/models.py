from django.db import models

# Create your models here.
from apps.common.models import TimeStampe
from apps.common.constants import ROLES
from apps.users.models import User

class Studio(TimeStampe):
    name=models.CharField(max_length=50)
    description=models.TextField()
    created_by=models.ForeignKey(User,on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name
    


class StudioMembership(TimeStampe):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    studio=models.ForeignKey(Studio,on_delete=models.CASCADE)
    role=models.CharField(max_length=50, choices=ROLES)

    def __str__(self):
        return f"{self.user.email} - {self.studio.name}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'studio'], name='unique_studio_membership'
            )
        ]

