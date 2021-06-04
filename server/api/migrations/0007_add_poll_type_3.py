from django.db import migrations,models

def create_poll_type_3(apps, schema_editor):
    PollType = apps.get_model('api', 'PollType')

    PollType.objects.create(id=3, name='Escolhe numero máximo de opções')
    

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0006_merge_20210512_0126')
    ]

    operations = [
        migrations.RunPython(create_poll_type_3),
        
        migrations.AddField(
            model_name='poll',
            name='votes_number',
            field=models.PositiveIntegerField(default=1),
        ),
    ]