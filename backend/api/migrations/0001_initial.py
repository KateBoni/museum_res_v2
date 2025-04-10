# Generated by Django 5.1.5 on 2025-03-18 16:29

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Museum',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('location', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('opening_hours', models.CharField(max_length=255)),
                ('capacity', models.PositiveIntegerField(default=200)),
                ('photo', models.ImageField(blank=True, null=True, upload_to='museum_photos/')),
                ('type', models.CharField(choices=[('history', 'History Museum'), ('art', 'Art Museum'), ('science', 'Science Museum'), ('ancient', 'archaeological Site '), ('other', 'Other')], default='other', max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Reservation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('num_tickets', models.PositiveIntegerField()),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('museum', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.museum')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
