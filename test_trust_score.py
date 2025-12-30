"""
Test script for Trust Score API endpoints
Run with: python test_trust_score.py
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_trust_score_endpoint():
    """Test the trust score endpoint with authentication"""
    
    print("=" * 60)
    print("Testing Trust Score API Endpoints")
    print("=" * 60)
    
    # Step 1: Login to get token
    print("\n1. Logging in...")
    login_data = {
        "username": "test_voter",  # Test user
        "password": "test123"  # Test password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        if response.status_code == 200:
            tokens = response.json()
            access_token = tokens.get('access')
            print(f"   ✓ Login successful! Token: {access_token[:20]}...")
        else:
            print(f"   ✗ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return
    except Exception as e:
        print(f"   ✗ Error during login: {e}")
        return
    
    # Step 2: Get trust score
    print("\n2. Fetching trust score...")
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/accounts/trust/my_trust/", headers=headers)
        if response.status_code == 200:
            trust_data = response.json()
            print(f"   ✓ Trust score retrieved successfully!")
            print(f"\n   Total Score: {trust_data.get('total_score', 0):.1f}/100")
            print(f"   User Type: {trust_data.get('user_type', 'N/A')}")
            
            # Verification status
            verification = trust_data.get('verification_breakdown', {})
            print(f"\n   Verification ({verification.get('points', 0)}/{verification.get('max_points', 15)} pts):")
            print(f"      Email: {'✓' if verification.get('email_verified') else '✗'}")
            print(f"      Phone: {'✓' if verification.get('phone_verified') else '✗'}")
            print(f"      Profile: {'✓' if verification.get('profile_complete') else '✗'}")
            
            # Engagement status
            engagement = trust_data.get('engagement_breakdown', {})
            print(f"\n   Engagement ({engagement.get('points', 0):.1f}/{engagement.get('max_points', 30)} pts):")
            print(f"      Votes: {engagement.get('votes_cast', 0)}")
            print(f"      Content: {engagement.get('content_published', 0)}")
            print(f"      Feedback: {engagement.get('positive_feedback_received', 0)}")
            
            # Creator status
            creator = trust_data.get('creator_breakdown', {})
            print(f"\n   Creator ({creator.get('points', 0):.1f}/{creator.get('max_points', 25)} pts):")
            print(f"      Sales: {creator.get('sales_completed', 0)}")
            print(f"      Rating: {creator.get('average_rating', 0):.1f}/5")
            print(f"      Disputes: {creator.get('dispute_count', 0)}")
            
            # Permissions
            print(f"\n   Permissions:")
            print(f"      Marketplace: {'✓' if trust_data.get('can_create_marketplace') else '✗'}")
            print(f"      Kixikila: {'✓' if trust_data.get('can_create_kixikila') else '✗'}")
            print(f"      Blog: {'✓' if trust_data.get('can_publish_blog') else '✗'}")
            
            # Recommendations
            recommendations = trust_data.get('recommendations', [])
            if recommendations:
                print(f"\n   Recommendations:")
                for rec in recommendations[:3]:  # Show top 3
                    priority_icon = "🔴" if rec['priority'] == 'high' else "🟡" if rec['priority'] == 'medium' else "🟢"
                    print(f"      {priority_icon} {rec['title']} (+{rec['points']} pts)")
                    print(f"         {rec['description']}")
            
            # Next milestone
            milestones = trust_data.get('milestones', {})
            next_milestone = milestones.get('next')
            if next_milestone:
                progress = milestones.get('progress_to_next', 0)
                print(f"\n   Next Milestone: {next_milestone['name']}")
                print(f"   Progress: {progress:.1f} points needed")
            else:
                print(f"\n   🎉 All milestones unlocked!")
            
        else:
            print(f"   ✗ Failed to fetch trust score: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ✗ Error fetching trust score: {e}")
    
    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)

if __name__ == "__main__":
    test_trust_score_endpoint()
