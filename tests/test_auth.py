import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.session import init_db, AsyncSessionLocal
from app.database.seed_data import seed_initial_data

@pytest.fixture(scope="session", autouse=True)
def anyio_backend():
    return "asyncio"

@pytest_asyncio.fixture(scope="module", autouse=True)
async def setup_database():
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"

@pytest.mark.asyncio
async def test_demo_user_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "demo@scholarpulse.edu", "password": "Demo1234!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "demo@scholarpulse.edu"

@pytest.mark.asyncio
async def test_list_papers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "demo@scholarpulse.edu", "password": "Demo1234!"}
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        resp = await client.get("/api/v1/papers", headers=headers)
        assert resp.status_code == 200
        papers = resp.json()
        assert len(papers) >= 3
        assert any("Attention" in p["title"] for p in papers)
