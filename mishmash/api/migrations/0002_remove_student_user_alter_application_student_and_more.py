# Generated by Django 5.1.5 on 2025-01-25 20:49

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models, connection


def drop_foreign_key_constraint(apps, schema_editor):
    with connection.cursor() as cursor:
        cursor.execute("""
        ALTER TABLE api_application
        DROP FOREIGN KEY api_application_student_id_9324f852_fk_api_student_user_id
        """)

class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(drop_foreign_key_constraint),
        migrations.RemoveField(
            model_name="student",
            name="user",
        ),
        migrations.AlterField(
            model_name="application",
            name="student",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.RemoveField(
            model_name="applicationresponse",
            name="question_number",
        ),
        migrations.AddField(
            model_name="application",
            name="date_of_birth",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="application",
            name="gpa",
            field=models.DecimalField(
                blank=True, decimal_places=2, default=0.0, max_digits=3, null=True
            ),
        ),
        migrations.AddField(
            model_name="application",
            name="major",
            field=models.CharField(default="Undeclared", max_length=100),
        ),
        migrations.AlterField(
            model_name="application",
            name="status",
            field=models.CharField(
                choices=[
                    ("Applied", "Applied"),
                    ("Enrolled", "Enrolled"),
                    ("Withdrawn", "Withdrawn"),
                    ("Canceled", "Canceled"),
                ],
                default="Applied",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="applicationresponse",
            name="application",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="responses",
                to="api.application",
            ),
        ),
        migrations.AlterField(
            model_name="applicationresponse",
            name="response",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="program",
            name="application_deadline",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="program",
            name="application_open_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="program",
            name="description",
            field=models.TextField(blank=True, default="No description provided."),
        ),
        migrations.AlterField(
            model_name="program",
            name="end_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="program",
            name="faculty_leads",
            field=models.CharField(default="Unknown", max_length=255),
        ),
        migrations.AlterField(
            model_name="program",
            name="start_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="user",
            name="display_name",
            field=models.CharField(default="New User", max_length=100),
        ),
        migrations.CreateModel(
            name="ApplicationQuestion",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("text", models.TextField(default="Default question text.")),
                ("is_required", models.BooleanField(default=True)),
                (
                    "program",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="questions",
                        to="api.program",
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="applicationresponse",
            name="question",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                to="api.applicationquestion",
            ),
        ),
        migrations.AddConstraint(
            model_name="applicationresponse",
            constraint=models.UniqueConstraint(
                fields=("application", "question"), name="unique_response_per_question"
            ),
        ),
        migrations.DeleteModel(
            name="Student",
        ),
    ]
