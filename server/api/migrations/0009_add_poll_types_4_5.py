from django.db import migrations,models

def create_poll_type_4(apps, schema_editor):
    PollType = apps.get_model('api', 'PollType')

    PollType.objects.create(id=4, name='Single non-transferable vote')

def create_poll_type_5(apps, schema_editor):
    PollType = apps.get_model('api', 'PollType')

    PollType.objects.create(id=5, name='Multiple non-transferable vote')
    
    

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0008_poll_email_info')
    ]

    operations = [
        migrations.RunPython(create_poll_type_4),
        
        migrations.RunPython(create_poll_type_5),
        
    ]
