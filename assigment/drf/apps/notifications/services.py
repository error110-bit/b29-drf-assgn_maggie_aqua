from .models import Notification


def _create_notification(receiver, sender, notification_type, title, message, **relations):
    """Create a notification unless the sender would notify themself."""
    if not receiver or not sender or receiver == sender:
        return None

    return Notification.objects.create(
        receiver=receiver,
        sender=sender,
        type=notification_type,
        title=title[:50],
        message=message,
        **relations,
    )


def notify_task_assigned(task, sender):
    """Notify a user when a new task is assigned to them."""
    return _create_notification(
        receiver=task.assigned_to,
        sender=sender,
        notification_type="Task",
        title="New task assigned",
        message=f"You have been assigned the task '{task.title}'.",
        project=task.project,
        task=task,
        stage=task.stage,
    )


def notify_comment_created(comment, sender):
    """Notify the discussion thread creator when someone comments."""
    thread = comment.thread
    return _create_notification(
        receiver=thread.created_by,
        sender=sender,
        notification_type="Comment",
        title="New comment",
        message=f"{sender.username} commented on thread {thread.id}.",
        project=thread.stage.project,
        stage=thread.stage,
        comment=comment,
    )


def notify_stage_approval_requested(stage_approval, sender):
    """Notify the selected approver about a stage approval request."""
    stage = stage_approval.stage
    return _create_notification(
        receiver=stage_approval.approved_by,
        sender=sender,
        notification_type="Stage",
        title="Stage approval requested",
        message=f"{sender.username} requested approval for the '{stage.stage}' stage.",
        project=stage.project,
        stage=stage,
        stage_proposal=stage_approval,
    )
