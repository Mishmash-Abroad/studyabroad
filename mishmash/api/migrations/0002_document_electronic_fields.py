# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='form_data',
            field=models.JSONField(blank=True, help_text='JSON data for electronic form fields', null=True),
        ),
        migrations.AddField(
            model_name='document',
            name='is_electronic',
            field=models.BooleanField(default=False, help_text='True if this is an electronic form submission, False if it\'s a PDF upload'),
        ),
        migrations.AddField(
            model_name='document',
            name='last_modified',
            field=models.DateTimeField(auto_now=True, help_text='Timestamp of the last modification'),
        ),
        migrations.AddField(
            model_name='document',
            name='parent_guardian_signature',
            field=models.TextField(blank=True, help_text='SVG or base64 encoded PNG signature data for parent/guardian (if under 18)', null=True),
        ),
        migrations.AddField(
            model_name='document',
            name='signature',
            field=models.TextField(blank=True, help_text='SVG or base64 encoded PNG signature data', null=True),
        ),
        migrations.AlterField(
            model_name='document',
            name='pdf',
            field=models.FileField(blank=True, null=True, upload_to='pdfs/'),
        ),
    ] 