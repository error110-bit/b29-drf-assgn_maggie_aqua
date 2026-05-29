from django.db import models
from apps.common.models import TimeStampe
from apps.common.constants import (ROLES,STAGE_CHOICES)
from apps.studios.models import Studio
from apps.users.models import User

# Create your models here.
class project(TimeStampe):
    studio=models.ForeignKey(Studio,on_delete=models.CASCADE)
    title=models.CharField(max_length=50)
    description=models.CharField(max_length=50)
    created_by=models.ForeignKey(User,on_delete=models.CASCADE,related_name='created_projects')
    lead_by=models.ForeignKey(User,on_delete=models.CASCADE,related_name='lead_projects')
   # current_stage=models.ForeignKey(Stage,on_delete=models.CASCADE)
    def __str__(self):
        return self.title

class projectMember(TimeStampe):
    project=models.ForeignKey(project,on_delete=models.CASCADE)
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    role=models.CharField(max_length=50,choices=ROLES)

    def __str__(self):
        return f"{self.user.email} - {self.project.title}"


class Stage(TimeStampe):
    project=models.ForeignKey(project,on_delete=models.CASCADE)
    stage=models.CharField(max_length=50,choices=STAGE_CHOICES)

    def __str__(self):
        return self.stage
    
class Task(TimeStampe):
    project=models.ForeignKey(project,on_delete=models.CASCADE)
    stage=models.ForeignKey(Stage,on_delete=models.CASCADE,null=True,blank=True)
    title=models.CharField(max_length=100)
    description=models.TextField()
    created_by=models.ForeignKey(User,on_delete=models.CASCADE,related_name='created_tasks')
    assigned_to=models.ForeignKey(User,on_delete=models.CASCADE,related_name='assigned_tasks')
    deadline=models.DateTimeField(null=True,blank=True)
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    ]
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')

    def __str__(self):
        return self.title
    
class StageApproval(TimeStampe):
    stage = models.ForeignKey(
        Stage,
        on_delete=models.CASCADE,
        related_name='approvals'
    )

    proposed_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='proposed_approvals'
    )

    approved_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='approved_approvals',
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=50,
       # choices=APPROVAL_STATUS,
        default="PENDING"
    )

  

   

   

    def __str__(self):
        return f"{self.stage} - {self.status}"
    
