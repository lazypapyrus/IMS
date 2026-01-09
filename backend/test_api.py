import requests
import json

base_url = "http://localhost:8000/api/"

def test_add_supplier():
    print("Testing Add Supplier API...")
    # Get token first
    login_data = {"username": "admin", "password": "adminpassword"}
    r = requests.post(base_url + "token/", json=login_data)
    if r.status_code != 200:
        print("Login failed:", r.text)
        return
    
    token = r.json()['access']
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    data = {
        "name": "Manual Test Supplier 2",
        "email": "manual@example.com",
        "phone": "1234567890",
        "address": "Localhost"
    }
    
    r = requests.post(base_url + "suppliers/", json=data, headers=headers)
    print("Status Code:", r.status_code)
    print("Response Body:", r.text)

if __name__ == "__main__":
    test_add_supplier()
