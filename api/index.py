import os
import sys

# Ensure backend directory is in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Ensure serverless writable temp paths for SQLite and uploads
if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "sqlite+aiosqlite:////tmp/scholarpulse.db"
if "UPLOAD_DIR" not in os.environ:
    os.environ["UPLOAD_DIR"] = "/tmp/uploads"

from app.main import app
