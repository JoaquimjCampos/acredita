# Generated migration for quiz models

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('quiz', '0001_initial'),  # Adjust based on actual last migration
    ]

    operations = [
        # Add new fields to Quiz
        migrations.AddField(
            model_name='quiz',
            name='is_active',
            field=models.BooleanField(default=True, help_text='Se True, o quiz está disponível para acesso'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='allow_anonymous_submission',
            field=models.BooleanField(default=True, help_text='Se True, usuários anônimos podem submeter respostas'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='quiz',
            name='public_access_count',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='quiz',
            name='authenticated_access_count',
            field=models.PositiveIntegerField(default=0),
        ),
        
        # Update is_public field help_text
        migrations.AlterField(
            model_name='quiz',
            name='is_public',
            field=models.BooleanField(default=True, help_text='Se True, permite acesso público sem autenticação'),
        ),
        
        # Update author field
        migrations.AlterField(
            model_name='quiz',
            name='author',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_quizzes', to=settings.AUTH_USER_MODEL),
        ),
        
        # Add indexes
        migrations.AddIndex(
            model_name='quiz',
            index=models.Index(fields=['season_number', 'is_active'], name='quiz_season_active_idx'),
        ),
        migrations.AddIndex(
            model_name='quiz',
            index=models.Index(fields=['is_public', 'is_active'], name='quiz_public_active_idx'),
        ),
        
        # Create QuizAccessLog model
        migrations.CreateModel(
            name='QuizAccessLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quiz_id', models.IntegerField(db_index=True)),
                ('ip_address', models.GenericIPAddressField()),
                ('access_type', models.CharField(choices=[('public', 'Acesso Público'), ('authenticated', 'Acesso Autenticado'), ('admin', 'Acesso Administrativo')], max_length=20)),
                ('user_agent', models.CharField(blank=True, max_length=500)),
                ('referrer', models.URLField(blank=True, null=True)),
                ('endpoint', models.CharField(max_length=255)),
                ('is_bot', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quiz_accesses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Quiz Access Log',
                'verbose_name_plural': 'Quiz Access Logs',
                'ordering': ['-created_at'],
            },
        ),
        
        # Add indexes to QuizAccessLog
        migrations.AddIndex(
            model_name='quizaccesslog',
            index=models.Index(fields=['quiz_id', '-created_at'], name='quiz_access_log_quiz_date_idx'),
        ),
        migrations.AddIndex(
            model_name='quizaccesslog',
            index=models.Index(fields=['user', '-created_at'], name='quiz_access_log_user_date_idx'),
        ),
        migrations.AddIndex(
            model_name='quizaccesslog',
            index=models.Index(fields=['ip_address', '-created_at'], name='quiz_access_log_ip_date_idx'),
        ),
    ]
