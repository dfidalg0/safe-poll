from django.db import migrations

def create_poll_type_1(apps, schema_editor):
    PollType = apps.get_model('api', 'PollType')

    PollType.objects.all().delete()

    PollType.objects.create(id=1, name='First Past the Post')

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0001_initial')
    ]

    operations = [
        migrations.RunPython(create_poll_type_1)
    ]
