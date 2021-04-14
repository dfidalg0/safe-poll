from django.db import migrations

def create_poll_type_2(apps, schema_editor):
    PollType = apps.get_model('api', 'PollType')

    PollType.objects.create(id=2, name='Tipo 2 sem nome ainda =(')
    

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0004_auto_20201127_2249')
    ]

    operations = [
        migrations.RunPython(create_poll_type_2)
    ]
