def test_health_check(client):
    """Test the GET /health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "Ajaia Docs"


def test_api_health_check(client):
    """Test the GET /api/health endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_root_endpoint(client):
    """Test the GET / root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Ajaia Docs" in data["message"]


def test_list_demo_users(client):
    """Test listing seeded demo users."""
    response = client.get("/api/auth/users")
    assert response.status_code == 200
    users = response.json()
    assert len(users) >= 2
    emails = [u["email"] for u in users]
    names = [u["name"] for u in users]
    assert "ayush@example.com" in emails
    assert "rahul@example.com" in emails
    assert "Ayush" in names
    assert "Rahul" in names


def test_login_by_user_id(client):
    """Test login using valid user_id."""
    response = client.post("/api/auth/login", json={"user_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["id"] == 1
    assert data["user"]["name"] == "Ayush"
    assert data["user"]["email"] == "ayush@example.com"
    assert "Logged in as Ayush" in data["message"]


def test_login_by_email(client):
    """Test login using valid email."""
    response = client.post("/api/auth/login", json={"email": "rahul@example.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["name"] == "Rahul"
    assert data["user"]["email"] == "rahul@example.com"


def test_login_invalid_user(client):
    """Test login with non-existent user."""
    response = client.post("/api/auth/login", json={"user_id": 9999})
    assert response.status_code == 404
    data = response.json()
    assert "User not found" in data["detail"]


def test_login_missing_parameters(client):
    """Test login validation failure when neither user_id nor email is provided."""
    response = client.post("/api/auth/login", json={})
    assert response.status_code == 422


def test_get_current_user_me(client):
    """Test GET /api/auth/me with X-User-Id header and query param."""
    # Test via query param
    resp = client.get("/api/auth/me?user_id=1")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Ayush"

    # Test via header
    resp_header = client.get("/api/auth/me", headers={"X-User-Id": "2"})
    assert resp_header.status_code == 200
    assert resp_header.json()["name"] == "Rahul"

    # Test missing param
    resp_missing = client.get("/api/auth/me")
    assert resp_missing.status_code == 400
