# Generated manually because the local runtime has no Django installation.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('studios', '0006_alter_studiomembership_role'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='studiomembership',
            constraint=models.UniqueConstraint(
                fields=('user', 'studio'), name='unique_studio_membership'
            ),
        ),
    ]
