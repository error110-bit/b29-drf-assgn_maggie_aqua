from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import project, Stage
from apps.discussions.models import Discussion_Thread


@receiver(post_save, sender=project)
def create_default_stage_and_thread(sender, instance, created, **kwargs):
  
    if not created:
        return

    # Create the default stage
    stage = Stage.objects.create(
        project=instance,
        stage='DRAFT'
    )

    # Create the general discussion thread for that stage
    Discussion_Thread.objects.create(
        stage=stage,
        created_by=instance.created_by
    )