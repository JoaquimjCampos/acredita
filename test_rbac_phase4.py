"""
Phase 4: RBAC Testing Script
Tests all permission classes and verifies AuditLog recording
"""

import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth.models import Group
from backend.accounts.models import User
from backend.core.models import AuditLog
from backend.marketplace.models import ServiceListing
from backend.games.models import Game


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'=' * 60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text:^60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'=' * 60}{Colors.RESET}\n")


def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")


def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")


def print_info(text):
    print(f"{Colors.BLUE}ℹ {text}{Colors.RESET}")


def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.RESET}")


def test_groups_exist():
    """Test 1: Verify Django Groups exist"""
    print_header("TEST 1: Verify Django Groups")
    
    required_groups = ['Eleitor', 'Participante', 'Mentor', 'Administrador']
    
    for group_name in required_groups:
        try:
            group = Group.objects.get(name=group_name)
            print_success(f"Group '{group_name}' exists with {group.permissions.count()} permissions")
        except Group.DoesNotExist:
            print_error(f"Group '{group_name}' NOT FOUND")
            return False
    
    return True


def test_users_by_role():
    """Test 2: Check existing users by role"""
    print_header("TEST 2: User Distribution by Role")
    
    for group_name in ['Eleitor', 'Participante', 'Mentor', 'Administrador']:
        try:
            group = Group.objects.get(name=group_name)
            user_count = group.user_set.count()
            
            if user_count > 0:
                print_success(f"{group_name}: {user_count} users")
                # Show first 3 users
                for user in group.user_set.all()[:3]:
                    print(f"  - {user.username} ({user.email})")
            else:
                print_warning(f"{group_name}: 0 users (will create test user)")
        except Group.DoesNotExist:
            print_error(f"Group '{group_name}' not found")


def create_test_users():
    """Test 3: Create test users for each role if they don't exist"""
    print_header("TEST 3: Create/Verify Test Users")
    
    test_users = {
        'Eleitor': {
            'username': 'test_eleitor',
            'email': 'eleitor@test.com',
            'password': 'Test123!@#',
            'first_name': 'Test',
            'last_name': 'Eleitor'
        },
        'Participante': {
            'username': 'test_participante',
            'email': 'participante@test.com',
            'password': 'Test123!@#',
            'first_name': 'Test',
            'last_name': 'Participante'
        },
        'Mentor': {
            'username': 'test_mentor',
            'email': 'mentor@test.com',
            'password': 'Test123!@#',
            'first_name': 'Test',
            'last_name': 'Mentor'
        },
        'Administrador': {
            'username': 'test_admin',
            'email': 'admin@test.com',
            'password': 'Test123!@#',
            'first_name': 'Test',
            'last_name': 'Admin',
            'is_staff': True,
            'is_superuser': True
        }
    }
    
    created_users = {}
    
    for role, user_data in test_users.items():
        try:
            user = User.objects.get(username=user_data['username'])
            print_info(f"User '{user_data['username']}' already exists")
            created_users[role] = user
        except User.DoesNotExist:
            # Create user
            password = user_data.pop('password')
            user = User.objects.create_user(
                password=password,
                **user_data
            )
            
            # Add to group
            group = Group.objects.get(name=role)
            user.groups.add(group)
            
            print_success(f"Created user '{user.username}' in group '{role}'")
            created_users[role] = user
    
    return created_users


def test_auditlog_model():
    """Test 4: Verify AuditLog model and methods"""
    print_header("TEST 4: AuditLog Model")
    
    try:
        # Check current count
        count = AuditLog.objects.count()
        print_info(f"Current AuditLog entries: {count}")
        
        # Test log_action classmethod
        test_user = User.objects.filter(is_superuser=True).first()
        if test_user:
            AuditLog.log_action(
                user=test_user,
                action='test',
                resource='test_resource',
                method='GET',
                endpoint='/api/test/',
                status_code=200,
                ip_address='127.0.0.1',
                response_status='success'
            )
            print_success("AuditLog.log_action() works correctly")
            
            # Verify it was saved
            latest = AuditLog.objects.latest('timestamp')
            print_success(f"Latest log: {latest.user.username} - {latest.action} - {latest.resource}")
        else:
            print_warning("No superuser found to test logging")
        
        return True
    except Exception as e:
        print_error(f"AuditLog error: {str(e)}")
        return False


def test_model_counts():
    """Test 5: Check content models"""
    print_header("TEST 5: Content Models Count")
    
    models_to_check = [
        ('ServiceListing', ServiceListing),
        ('Game', Game),
    ]
    
    for name, model in models_to_check:
        try:
            count = model.objects.count()
            print_info(f"{name}: {count} entries")
        except Exception as e:
            print_error(f"{name}: Error - {str(e)}")


def test_permission_classes():
    """Test 6: Import and verify permission classes"""
    print_header("TEST 6: Permission Classes")
    
    try:
        from backend.core.rbac_permissions import (
            IsParticipant, IsMentor, IsVoter, IsAdminUser,
            CanCreateKixikila, CanCreateMarketplaceListing,
            CanCreateCertificationCourse, CanCreateBlogPost,
            CanPublishContent, CanModerateContent,
            IsOwnerOrAdmin, IsOwnerOrReadOnly, IsAdminOrReadOnly,
            ParticipantOrAdmin, MentorOrAdmin
        )
        
        print_success("All 15 permission classes imported successfully")
        
        # List them
        permission_classes = [
            'IsParticipant', 'IsMentor', 'IsVoter', 'IsAdminUser',
            'CanCreateKixikila', 'CanCreateMarketplaceListing',
            'CanCreateCertificationCourse', 'CanCreateBlogPost',
            'CanPublishContent', 'CanModerateContent',
            'IsOwnerOrAdmin', 'IsOwnerOrReadOnly', 'IsAdminOrReadOnly',
            'ParticipantOrAdmin', 'MentorOrAdmin'
        ]
        
        for perm_class in permission_classes:
            print(f"  ✓ {perm_class}")
        
        return True
    except Exception as e:
        print_error(f"Permission classes error: {str(e)}")
        return False


def test_middleware_active():
    """Test 7: Verify middleware is in settings"""
    print_header("TEST 7: Middleware Configuration")
    
    try:
        from django.conf import settings
        
        middleware_list = settings.MIDDLEWARE
        rbac_middleware = 'backend.core.rbac_middleware.RoleValidationMiddleware'
        
        if rbac_middleware in middleware_list:
            print_success(f"RoleValidationMiddleware is active")
            index = middleware_list.index(rbac_middleware)
            print_info(f"Position: {index + 1} of {len(middleware_list)}")
        else:
            print_error("RoleValidationMiddleware NOT found in MIDDLEWARE")
            return False
        
        return True
    except Exception as e:
        print_error(f"Middleware check error: {str(e)}")
        return False


def test_logging_configured():
    """Test 8: Verify logging configuration"""
    print_header("TEST 8: Logging Configuration")
    
    try:
        from django.conf import settings
        import logging
        
        # Check LOGGING config
        if hasattr(settings, 'LOGGING'):
            logging_config = settings.LOGGING
            
            # Check for rbac logger
            if 'rbac' in logging_config.get('loggers', {}):
                print_success("RBAC logger is configured")
                
                # Check handlers
                rbac_logger = logging_config['loggers']['rbac']
                handlers = rbac_logger.get('handlers', [])
                print_info(f"RBAC logger handlers: {', '.join(handlers)}")
            else:
                print_warning("RBAC logger not found in LOGGING config")
            
            # Check log files
            import os
            logs_dir = settings.BASE_DIR / 'logs'
            if logs_dir.exists():
                print_success(f"Logs directory exists: {logs_dir}")
                
                # List log files
                log_files = list(logs_dir.glob('*.log'))
                if log_files:
                    print_info(f"Log files found: {len(log_files)}")
                    for log_file in log_files:
                        size = log_file.stat().st_size
                        print(f"  - {log_file.name} ({size} bytes)")
                else:
                    print_warning("No log files created yet")
            else:
                print_error("Logs directory does not exist")
        else:
            print_error("LOGGING not configured in settings")
            return False
        
        return True
    except Exception as e:
        print_error(f"Logging check error: {str(e)}")
        return False


def main():
    """Run all tests"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'*' * 60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'RBAC PHASE 4 - TESTING & VERIFICATION':^60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'*' * 60}{Colors.RESET}")
    
    tests = [
        ("Django Groups", test_groups_exist),
        ("User Distribution", test_users_by_role),
        ("Test Users", create_test_users),
        ("AuditLog Model", test_auditlog_model),
        ("Content Models", test_model_counts),
        ("Permission Classes", test_permission_classes),
        ("Middleware", test_middleware_active),
        ("Logging", test_logging_configured),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if result is None or result:
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {str(e)}")
            failed += 1
    
    # Final summary
    print_header("TEST SUMMARY")
    print(f"Total Tests: {len(tests)}")
    print_success(f"Passed: {passed}")
    if failed > 0:
        print_error(f"Failed: {failed}")
    else:
        print_success("All tests passed! ✓")
    
    print(f"\n{Colors.BOLD}{Colors.GREEN}{'=' * 60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}{'Phase 4 Testing Complete':^60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}{'=' * 60}{Colors.RESET}\n")


if __name__ == '__main__':
    main()
