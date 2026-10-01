# ScholarPulse — AI Research Digest & Literature Assistant

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PyMuPDF](https://img.shields.io/badge/PDF_Engine-PyMuPDF-FF6F00.svg?style=flat)](https://pymupdf.readthedocs.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **A production-style, full-stack AI research productivity platform engineered for students, college faculty, and research scholars to understand, compare, synthesize, and organize peer-reviewed literature with verifiable citation grounding.**

---

## 🌟 Key Highlights & Core Features

### 1. 📄 AI Paper Reader & Structured Digest
* **PyMuPDF Ingestion:** Extracts text streams, layout bounding boxes, and academic heading structures.
* **Structured Digest:** Instantly breaks down papers into **Executive Summary**, **Research Problem**, **Primary Motivation**, **Step-by-Step Methodology**, **Benchmark Dataset Details**, **Model Architectures**, **Empirical Metric Results**, **Limitations**, and **Future Work**.
* **Factual Scorecard:** Displays verified citation count, publication year, dataset reporting status, and experiments count.

### 2. 🎓 "Explain Like I'm a Student"
* Converts dense academic jargon and mathematical formulations into intuitive explanations across 3 difficulty levels:
  - **Beginner Mode:** Intuitive real-world analogies and simple language.
  - **Intermediate Mode:** Clear architectural breakdown with balanced terminology.
  - **Technical Mode:** Formal mathematical formulations, matrix tensor operations, and optimization dynamics.

### 3. 💬 Grounded Paper Q&A (Zero-Hallucination RAG)
* **Single-Paper Chat:** Interactive RAG assistant that answers questions exclusively from extracted chunks.
* **Verifiable Citation Badges:** Every claim highlights the exact **Section Heading**, **Page Number**, and **Verifiable Text Excerpt**.
* **Strict Invariant:** If information is absent from the PDF, it explicitly states: *"I couldn't find sufficient evidence for this in the uploaded paper."*

### 4. ⚖️ Multi-Paper Comparative Matrix
* Side-by-side comparison across 8 evaluation dimensions:
  1. Research Problem
  2. Primary Motivation
  3. Methodology & Architecture
  4. Benchmark Datasets
  5. Algorithms & Optimization
  6. Key Results & Metrics
  7. Acknowledged Limitations
  8. Proposed Future Work
* Synthesizes cross-paper natural language narratives and key differentiators.

### 5. 🔍 10-Category Research Gap Finder
* Discovers actionable research gaps backed by literature evidence across 10 categories:
  `Dataset gap`, `Methodology gap`, `Geographic gap`, `Population gap`, `Performance gap`, `Generalization gap`, `Explainability gap`, `Scalability gap`, `Data availability gap`, `Evaluation gap`.
* Clearly separates **Evidence from Papers** from **Potential Research Directions**.

### 6. 📝 10-Section Literature Review Generator
* Generates formal literature reviews structured into:
  *1. Introduction*, *2. Research Theme*, *3. Existing Approaches*, *4. Methodological Trends*, *5. Dataset Trends*, *6. Findings*, *7. Contradictions*, *8. Limitations*, *9. Research Gaps*, *10. Future Directions*, and *References*.

### 7. 📚 Citation Generator & Formatter
* Instant formatted export for:
  - **APA (7th Edition)**
  - **IEEE**
  - **MLA (9th Edition)**
  - **Chicago (17th Edition)**
  - **BibTeX**
  - **RIS Format**

### 8. 📊 Interactive Visual Topologies
* **Citation Force Graph:** Interactive SVG network graph mapping citation linkages and central influence hubs.
* **2D Topic Embedding Map:** Dimensionality-reduced vector space cluster map of research literature.
* **Literature Timeline (2016–2026):** Chronological trajectory of algorithmic breakthroughs.

### 9. 📁 Research Organization & Notebook
* **Collections:** Categorized folders with color badges.
* **Notes & Highlights:** Academic notebook with tag filtering (`Important Method`, `Research Gap`, `Use in Project`, `Key Finding`).
* **Reading Progress:** 0% &rarr; 25% &rarr; 50% &rarr; 75% &rarr; 100% completed tracking.

### 10. 🎯 College Viva & Presentation Mode
* Full-screen interactive slide deck covering Problem, Architecture, RAG Pipeline, Demo Workflow, and Examiner Q&A Defense.

---

## 🏗️ System Architecture

```
+-------------------------------------------------------------------------+
|                         Frontend Client (React + TS + Vite)            |
|  - Split-View Reader  - Comparison Matrix  - Review Builder  - Graphs   |
+------------------------------------+------------------------------------+
                                     |  REST API Calls
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

## 🚀 Quick Start & Local Installation

### Prerequisites
* Python 3.10+
* Node.js v18+ & npm

### 1. Clone & Setup Backend
```bash
cd backend
python -m venv venv

# Activate Virtual Environment:
# Windows:
.\venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Run Backend Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```
> *The backend automatically initializes the database schema and seeds 3 foundational open-access papers (Attention Is All You Need, LoRA, ResNet) with pre-indexed vector embeddings on first boot!*

### 3. Setup & Run Frontend
```bash
# In a new terminal window:
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Running Automated Tests

```bash
cd backend
.\venv\Scripts\python -m pytest ..\tests -v
```
All unit and integration tests verify:
- Authentication & JWT token generation
- PDF parsing and section classification
- Sentence Transformer & TF-IDF 384-dimensional vector embeddings
- Multi-style citation formatting (APA, IEEE, MLA, Chicago, BibTeX, RIS)
- Research Gap 10-category classification

---

## 📦 Project Structure

```
research-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & lifespan initializer
│   │   ├── config.py            # Pydantic settings & environment configs
│   │   ├── database/            # SQLAlchemy 2.0 models & seed data
│   │   ├── schemas/             # Pydantic v2 validation schemas
│   │   ├── security/            # JWT tokens & PBKDF2 password hashing
│   │   ├── services/            # PyMuPDF extractor, Semantic Scholar API, Export service
│   │   ├── ai/                  # Digest, Simplifier, Gap detector, Review generator
│   │   ├── rag/                 # Chunker, Embeddings engine, Vector store, Retriever
│   │   └── api/                 # Modular API routers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Navbar, Sidebar, CommandPalette, Toasts, ScorecardBadge
│   │   │   ├── reader/          # SplitViewReader (Two-panel PDF/Extracted + AI assistant)
│   │   │   ├── visual/          # CitationGraph, TopicEmbeddingMap, PaperTimeline
│   │   │   └── presentation/    # VivaDeck presentation slides, PipelineExplainer
│   │   ├── pages/               # 18 Full Pages (Dashboard, Library, Upload, Compare, etc.)
│   │   ├── contexts/            # AuthContext & WorkspaceContext
│   │   ├── services/            # API client service
│   │   └── types/               # TypeScript interfaces
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docs/                        # Complete technical documentation (Architecture, API, Database, RAG)
├── submission/                  # College project submission report & viva defense guide
├── tests/                       # Automated pytest test suite
├── research-resources.md        # Verified open-access index & repository catalog
├── docker-compose.yml           # Production containerization
└── README.md
```

---

## 🎓 Viva Defense & Presentation Mode
ScholarPulse includes a dedicated **Presentation / Viva Mode** accessible directly from the navbar or sidebar. It provides:
1. **Interactive Slide Deck:** Project Problem, Solution, Architecture, RAG Pipeline, Demo Workflow, and Research Impact.
2. **Viva Defense Q&A Cheat Sheet:** Anticipated technical questions regarding hallucinations, vector math, PDF OCR, and database scalability.

---

## 🛡️ License
Distributed under the MIT License.
