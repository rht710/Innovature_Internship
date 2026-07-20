from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_qamessage_recipient'),
    ]

    operations = [
        migrations.AddField(
            model_name='qamessage',
            name='is_read',
            field=models.BooleanField(default=False),
        ),
    ]
