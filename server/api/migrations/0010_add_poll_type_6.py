from django.db import migrations,models

def create_poll_type_6(apps, schema_editor):
    PollType = apps.get_model('api', 'PollType')

    PollType.objects.create(id=6, name='Cumulative voting')
    
    

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0009_add_poll_types_4_5')
    ]

    operations = [        

        migrations.RunPython(create_poll_type_6),

    ]
