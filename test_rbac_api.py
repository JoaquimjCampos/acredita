"""
Phase 4: API Endpoint Testing with Different Roles
Tests permission enforcement on actual API endpoints
"""

import requests
import json
from typing import Dict, Optional


# Base URL
BASE_URL = "http://localhost:8000/api"

# Test users credentials
TEST_USERS = {
    'eleitor': {'username': 'test_eleitor', 'password': 'Test123!@#'},
    'participante': {'username': 'test_participante', 'password': 'Test123!@#'},
    'mentor': {'username': 'test_mentor', 'password': 'Test123!@#'},
    'admin': {'username': 'test_admin', 'password': 'Test123!@#'},
}


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'=' * 70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text:^70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'=' * 70}{Colors.RESET}\n")


def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")


def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")


def print_info(text):
    print(f"{Colors.BLUE}ℹ {text}{Colors.RESET}")


def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.RESET}")


def get_token(username: str, password: str) -> Optional[str]:
    """Get JWT token for user"""
    try:
        response = requests.post(
            f"{BASE_URL}/accounts/token/",
            json={'username': username, 'password': password}
        )
        if response.status_code == 200:
            return response.json()['access']
        else:
            print_error(f"Failed to get token for {username}: {response.status_code}")
            return None
    except Exception as e:
        print_error(f"Token request error: {str(e)}")
        return None


def make_request(method: str, endpoint: str, token: Optional[str] = None, data: Optional[Dict] = None):
    """Make API request with token"""
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            headers['Content-Type'] = 'application/json'
            response = requests.post(url, headers=headers, json=data)
        elif method == 'PUT':
            headers['Content-Type'] = 'application/json'
            response = requests.put(url, headers=headers, json=data)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            print_error(f"Unsupported method: {method}")
            return None
        
        return response
    except requests.exceptions.ConnectionError:
        print_error("Connection error - is the server running?")
        return None
    except Exception as e:
        print_error(f"Request error: {str(e)}")
        return None


def test_authentication():
    """Test 1: Authentication for all roles"""
    print_header("TEST 1: Authentication & JWT Tokens")
    
    tokens = {}
    for role, credentials in TEST_USERS.items():
        token = get_token(credentials['username'], credentials['password'])
        if token:
            print_success(f"{role.capitalize()}: Token obtained")
            tokens[role] = token
        else:
            print_error(f"{role.capitalize()}: Failed to get token")
    
    return tokens


def test_marketplace_permissions(tokens: Dict[str, str]):
    """Test 2: Marketplace ServiceListing permissions"""
    print_header("TEST 2: Marketplace Permissions (CanCreateMarketplaceListing)")
    
    # Test data
    test_listing = {
        "title": "Test Service",
        "description": "Test description",
        "price": "100.00",
        "service_type": "service"
    }
    
    # Test GET (all roles should be able to view)
    print_info("Testing GET /marketplace/listings/ (should work for all)")
    for role, token in tokens.items():
        response = make_request('GET', '/marketplace/listings/', token)
        if response and response.status_code == 200:
            print_success(f"  {role.capitalize()}: GET allowed ({len(response.json())} items)")
        else:
            status = response.status_code if response else "No response"
            print_error(f"  {role.capitalize()}: GET failed ({status})")
    
    # Test POST (only Participante, Mentor, Admin should succeed)
    print_info("\nTesting POST /marketplace/listings/ (Participante+ only)")
    
    # Eleitor should be DENIED
    response = make_request('POST', '/marketplace/listings/', tokens.get('eleitor'), test_listing)
    if response and response.status_code == 403:
        print_success("  Eleitor: Correctly denied (403)")
    else:
        status = response.status_code if response else "No response"
        print_error(f"  Eleitor: Should be denied but got {status}")
    
    # Participante should be ALLOWED
    response = make_request('POST', '/marketplace/listings/', tokens.get('participante'), test_listing)
    if response and response.status_code in [200, 201]:
        print_success("  Participante: Correctly allowed (201)")
    else:
        status = response.status_code if response else "No response"
        print_warning(f"  Participante: Expected 201 but got {status}")
        if response:
            print(f"    Response: {response.text[:200]}")


def test_games_permissions(tokens: Dict[str, str]):
    """Test 3: Games permissions"""
    print_header("TEST 3: Games Permissions (CanCreateKixikila)")
    
    # Test data
    test_game = {
        "title": "Test Game",
        "description": "Test game description",
        "type": "quiz",
        "max_score": 100
    }
    
    # Test GET (all authenticated users should view)
    print_info("Testing GET /games/ (should work for all)")
    for role, token in tokens.items():
        response = make_request('GET', '/games/', token)
        if response and response.status_code == 200:
            count = len(response.json()) if isinstance(response.json(), list) else response.json().get('count', 0)
            print_success(f"  {role.capitalize()}: GET allowed ({count} items)")
        else:
            status = response.status_code if response else "No response"
            print_error(f"  {role.capitalize()}: GET failed ({status})")
    
    # Test POST (only Participante, Mentor, Admin should succeed)
    print_info("\nTesting POST /games/ (Participante+ only)")
    
    # Eleitor should be DENIED
    response = make_request('POST', '/games/', tokens.get('eleitor'), test_game)
    if response and response.status_code == 403:
        print_success("  Eleitor: Correctly denied (403)")
    else:
        status = response.status_code if response else "No response"
        print_error(f"  Eleitor: Should be denied but got {status}")
    
    # Participante should be ALLOWED
    response = make_request('POST', '/games/', tokens.get('participante'), test_game)
    if response and response.status_code in [200, 201]:
        print_success("  Participante: Correctly allowed (201)")
    else:
        status = response.status_code if response else "No response"
        print_warning(f"  Participante: Expected 201 but got {status}")
        if response:
            print(f"    Response: {response.text[:200]}")


def test_queryset_filtering(tokens: Dict[str, str]):
    """Test 4: Role-based queryset filtering"""
    print_header("TEST 4: Role-Based Queryset Filtering")
    
    print_info("Checking if different roles see different data...")
    
    # Get marketplace listings for each role
    eleitor_response = make_request('GET', '/marketplace/listings/', tokens.get('eleitor'))
    participante_response = make_request('GET', '/marketplace/listings/', tokens.get('participante'))
    
    if eleitor_response and participante_response:
        eleitor_count = len(eleitor_response.json()) if isinstance(eleitor_response.json(), list) else eleitor_response.json().get('count', 0)
        participante_count = len(participante_response.json()) if isinstance(participante_response.json(), list) else participante_response.json().get('count', 0)
        
        print_info(f"  Eleitor sees: {eleitor_count} listings")
        print_info(f"  Participante sees: {participante_count} listings")
        
        if participante_count >= eleitor_count:
            print_success("  Queryset filtering working: Participante sees >= Eleitor")
        else:
            print_warning("  Queryset filtering may not be working correctly")


def test_auditlog_recording():
    """Test 5: Verify AuditLog is recording API calls"""
    print_header("TEST 5: AuditLog Recording")
    
    print_info("Checking AuditLog entries...")
    
    # We need to check this via Django ORM
    try:
        import os
        import django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
        django.setup()
        
        from backend.core.models import AuditLog
        
        # Get recent logs
        recent_logs = AuditLog.objects.all().order_by('-timestamp')[:10]
        
        if recent_logs.exists():
            print_success(f"Found {recent_logs.count()} recent AuditLog entries")
            
            for log in recent_logs[:5]:
                print(f"  - {log.user.username} | {log.action} | {log.resource} | {log.status_code} | {log.timestamp.strftime('%H:%M:%S')}")
        else:
            print_warning("No AuditLog entries found - logs may not be recording")
            
    except Exception as e:
        print_warning(f"Could not check AuditLog: {str(e)}")


def main():
    """Run all API tests"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'*' * 70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'RBAC API ENDPOINT TESTING':^70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'*' * 70}{Colors.RESET}")
    
    print_warning("\n⚠️  IMPORTANT: Make sure Django server is running on http://localhost:8000\n")
    
    # Get tokens for all users
    tokens = test_authentication()
    
    if not tokens:
        print_error("\nFailed to get authentication tokens. Stopping tests.")
        return
    
    # Run permission tests
    test_marketplace_permissions(tokens)
    test_games_permissions(tokens)
    test_queryset_filtering(tokens)
    test_auditlog_recording()
    
    # Final summary
    print_header("API TESTING COMPLETE")
    print_success("All API tests executed!")
    print_info("Check the results above for any failures or warnings.")
    print(f"\n{Colors.BOLD}{Colors.GREEN}{'=' * 70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}{'Next: Check Django Admin for AuditLog entries':^70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}{'=' * 70}{Colors.RESET}\n")


if __name__ == '__main__':
    main()
