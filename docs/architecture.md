# System Architecture Documentation

ScholarPulse follows a decoupled, production-grade 3-tier architecture:

```
+-------------------------------------------------------------------------+
|                         Frontend Client (React + TS + Vite)            |
|  - Split-View Reader  - Comparison Matrix  - Review Builder  - Graphs   |
+------------------------------------+------------------------------------+
                                     |  REST API Calls (Axios / Fetch)
                                     v
+-------------------------------------------------------------------------+
|                         Backend Tier (FastAPI Async)                    |
|  - Auth & JWT Security       - PDF Ingestion & Section Parsing (PyMuPDF)|
|  - RAG Retrieval Controller  - Export Engine (PDF / DOCX / MD)          |
|  - Analytics & Visuals       - Semantic Scholar Integration             |
+-------------------+----------------+--------------------+---------------+
                    |                |                    |
                    v                v                    v
+-----------------------+ +--------------------+ +------------------------+
|  Relational Database  | | Vector Store Index | |   AI / LLM Router      |
|  (SQLite / PostgreSQL)| | (Cosine Similarity)| | (Gemini / OpenAI /     |
|  15 Relational Tables | | SentenceTransf.    | | Grounded Fallback)     |
+-----------------------+ +--------------------+ +------------------------+
```

---

## 1. Frontend Layer
* Built with **React 18** and **TypeScript** bundled with **Vite**.
* **Tailwind CSS** provides an academic slate color system with full dark/light theme persistence.
* **Workspace Selection Basket** allows users to select 1 to 10 papers across library pages and trigger cross-paper actions via the floating bottom toolbar.
* **Command Palette (`Ctrl+K`)** enables keyboard-first navigation and rapid querying.

## 2. Backend Layer
* Implemented in **FastAPI** with async route handlers.
* Modular router design: `/auth`, `/papers`, `/chat`, `/compare`, `/literature-review`, `/research-gap`, `/ideas`, `/collections`, `/notes`, `/citations`, `/search`, `/analytics`, `/export`, `/admin`.
* Strict Pydantic v2 schemas for all inputs and responses.

## 3. Storage Layer
* **SQL Database:** SQLAlchemy 2.0 async engine.
* **Vector Store:** Normalized 384-dimensional dense vectors with cosine similarity search and section filtering.
