# Generated by Django 3.1.3 on 2020-11-28 01:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_auto_20201127_2212'),
    ]

    operations = [
        migrations.RenameField(
            model_name='poll',
            old_name='name',
            new_name='title',
        ),
    ]