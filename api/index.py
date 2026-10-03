import os
import sys

# Ensure paths
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

for path in [backend_dir, root_dir, current_dir]:
    if os.path.exists(path) and path not in sys.path:
        sys.path.insert(0, path)

# Serverless SQLite paths
if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "sqlite+aiosqlite:////tmp/scholarpulse.db"
if "UPLOAD_DIR" not in os.environ:
    os.environ["UPLOAD_DIR"] = "/tmp/uploads"

from app.main import app

try:
    from mangum import Mangum
    handler = Mangum(app, lifespan="off")
except Exception:
    handler = app
