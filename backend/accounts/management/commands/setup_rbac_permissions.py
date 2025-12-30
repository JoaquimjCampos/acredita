"""
Management command para setup inicial de Groups e Permissions
Execução: python manage.py setup_rbac_permissions

Este comando:
1. Cria 4 grupos principais (Eleitor, Participante, Mentor, Administrador)
2. Define permissões para cada grupo
3. Atribui permissões aos grupos
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.apps import apps


class Command(BaseCommand):
    help = 'Setup inicial de RBAC: Groups e Permissions'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Iniciando setup de RBAC...'))

        # 1. Criar Grupos
        voter_group, created = Group.objects.get_or_create(name='Eleitor')
        participant_group, created = Group.objects.get_or_create(name='Participante')
        mentor_group, created = Group.objects.get_or_create(name='Mentor')
        admin_group, created = Group.objects.get_or_create(name='Administrador')

        self.stdout.write(self.style.SUCCESS('✓ Grupos criados'))

        # 2. Definir permissões por grupo
        self._setup_voter_permissions(voter_group)
        self._setup_participant_permissions(participant_group)
        self._setup_mentor_permissions(mentor_group)
        self._setup_admin_permissions(admin_group)

        self.stdout.write(self.style.SUCCESS('✓ Permissões atribuídas aos grupos'))
        self.stdout.write(self.style.SUCCESS('\n✅ Setup de RBAC completado com sucesso!'))

    def _setup_voter_permissions(self, group):
        """Eleitor (Voter) - Acesso de leitura apenas"""
        permissions = [
            self._get_permission('accounts', 'user', 'view'),
            self._get_permission('content', 'post', 'view'),
            self._get_permission('blog', 'post', 'view'),
            self._get_permission('certifications', 'certification', 'view'),
            self._get_permission('marketplace', 'listing', 'view'),
            self._get_permission('games', 'game', 'view'),
            self._get_permission('voting', 'vote', 'view'),
        ]
        group.permissions.set([p for p in permissions if p])
        self.stdout.write(f'  - Eleitor: {len([p for p in permissions if p])} permissões')

    def _setup_participant_permissions(self, group):
        """Participante - Criar Kixikila, vender no marketplace"""
        permissions = [
            self._get_permission('accounts', 'user', 'view'),
            self._get_permission('content', 'post', 'view'),
            self._get_permission('blog', 'post', 'view'),
            self._get_permission('certifications', 'certification', 'view'),
            self._get_permission('marketplace', 'listing', 'view'),
            self._get_permission('marketplace', 'listing', 'add'),  # Criar
            self._get_permission('marketplace', 'listing', 'change'),  # Editar próprios
            self._get_permission('marketplace', 'listing', 'delete'),  # Deletar próprios
            self._get_permission('games', 'game', 'view'),
            self._get_permission('games', 'game', 'add'),  # Criar Kixikila
            self._get_permission('voting', 'vote', 'view'),
            self._get_permission('voting', 'vote', 'add'),  # Votar
        ]
        group.permissions.set([p for p in permissions if p])
        self.stdout.write(f'  - Participante: {len([p for p in permissions if p])} permissões')

    def _setup_mentor_permissions(self, group):
        """Mentor - Criar certificações, blog posts, moderar"""
        permissions = [
            self._get_permission('accounts', 'user', 'view'),
            self._get_permission('content', 'post', 'view'),
            self._get_permission('content', 'post', 'add'),
            self._get_permission('content', 'post', 'change'),
            self._get_permission('content', 'post', 'delete'),
            self._get_permission('blog', 'post', 'view'),
            self._get_permission('blog', 'post', 'add'),
            self._get_permission('blog', 'post', 'change'),
            self._get_permission('blog', 'post', 'delete'),
            self._get_permission('certifications', 'certification', 'view'),
            self._get_permission('certifications', 'certification', 'add'),
            self._get_permission('certifications', 'certification', 'change'),
            self._get_permission('certifications', 'certification', 'delete'),
            self._get_permission('marketplace', 'listing', 'view'),
            self._get_permission('games', 'game', 'view'),
            self._get_permission('games', 'game', 'add'),
            self._get_permission('voting', 'vote', 'view'),
        ]
        group.permissions.set([p for p in permissions if p])
        self.stdout.write(f'  - Mentor: {len([p for p in permissions if p])} permissões')

    def _setup_admin_permissions(self, group):
        """Administrador - Acesso total"""
        # Admin tem todas as permissões já, só para ser explícito:
        all_permissions = Permission.objects.all()
        group.permissions.set(all_permissions)
        self.stdout.write(f'  - Administrador: {all_permissions.count()} permissões (TODAS)')

    def _get_permission(self, app_label, model, action):
        """Helper para obter permissão por app, model e action"""
        try:
            content_type = ContentType.objects.get(
                app_label=app_label,
                model=model
            )
            # Django usa codename: "add_model", "change_model", "delete_model", "view_model"
            codename_map = {
                'add': f'add_{model}',
                'change': f'change_{model}',
                'delete': f'delete_{model}',
                'view': f'view_{model}',
            }
            codename = codename_map.get(action, f'{action}_{model}')
            return Permission.objects.get(
                content_type=content_type,
                codename=codename
            )
        except (ContentType.DoesNotExist, Permission.DoesNotExist):
            return None
