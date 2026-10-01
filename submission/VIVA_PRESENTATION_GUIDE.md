# Viva Defense & Examiner Demonstration Guide

This guide assists students and project teams during college presentations, project evaluations, and viva defenses.

---

## 1. 5-Minute Live Viva Walkthrough Script

### Minute 1: Introduction & Problem Statement
* *Say:* "Good morning, respected examiners. Today we present **ScholarPulse**, a production-style, AI-powered research platform for literature analysis and synthesis."
* *Click:* Open Landing Page -> Click **"Explore Demo"** or **"Viva Mode"**.
* *Highlight:* "Existing tools hallucinate fake citations or act as superficial chat wrappers. ScholarPulse guarantees strict provenance with verifiable section and page citations."

### Minute 2: PDF Upload, Extraction & Structured Digest
* *Navigate:* Go to **"Upload Paper"** -> Drag & drop a PDF.
* *Demonstrate:* Show real-time stepped progress (`Extracting layout`, `Detecting sections`, `Indexing vectors`).
* *Showcase:* Open the **Split-View Reader** -> Walk through the Structured Digest (Problem, Motivation, Method, Benchmark Dataset, Empirical Results, Limitations).

### Minute 3: Grounded RAG Chat & "Explain Simply"
* *Demonstrate:* In Split Reader, click the **Chat** tab -> Click prompt: *"What is the main contribution?"*.
* *Highlight to Examiner:* Point out the **Retrieved Grounded Evidence** box showing exact Section and Page numbers.
* *Demonstrate:* Click **"Explain Simply"** -> Switch between **Beginner**, **Intermediate**, and **Technical** modes to show how math formulas are translated into intuitive analogies.

### Minute 4: Multi-Paper Synthesis & Research Gaps
* *Navigate:* Go to **"My Library"** -> Check boxes for *Attention Is All You Need* and *LoRA*.
* *Click:* Bottom floating toolbar **"Compare"** -> Show the 8-category side-by-side matrix.
* *Click:* **"Find Gaps"** -> Show the 10-category gap detector clearly separating **Evidence from Papers** from **Potential Research Directions**.
* *Click:* **"Literature Review"** -> Show the 10-section synthesized review with copyable APA/IEEE bibliography.

### Minute 5: Visual Topology & Conclusion
* *Navigate:* Go to **"Analytics & Maps"** -> Show the **Interactive Citation Graph**, **2D Topic Map**, and **Literature Timeline**.
* *Conclude:* "ScholarPulse provides an end-to-end verifiable pipeline for academic productivity, from raw manuscript ingestion to thesis ideation."

---

## 2. Top 8 Examiner Technical Questions & Model Answers

### Q1: How does your RAG pipeline prevent the LLM from hallucinating experimental results?
> **Answer:** "We enforce a two-stage guardrail: First, we retrieve top-K relevant chunks using vector cosine similarity. Second, our system prompt strictly restricts the LLM to ground its response exclusively in the retrieved context and output exact section/page citations. If retrieved similarity scores fall below threshold or evidence is absent, the system executes a deterministic fallback stating evidence is insufficient rather than guessing."

### Q2: Why use Sentence Transformers instead of basic keyword search?
> **Answer:** "Keyword search fails on vocabulary mismatch (e.g. 'PEFT' vs 'Low-Rank Adaptation' or 'Residual Connection' vs 'Skip Highway'). Sentence Transformers project words into a dense 384-dimensional semantic space where conceptual synonyms have high cosine similarity."

### Q3: How do you extract structured sections from PDFs with different publisher layouts?
> **Answer:** "We use PyMuPDF (`pymupdf`) to extract layout streams, fonts, and bounding boxes, paired with a resilient academic heading classifier that identifies standard sections (Abstract, Intro, Methods, Results, Limitations, References). If section headings deviate from standard IEEE/ACM formats, the chunker falls back to layout-bounded page chunking with zero data loss."

### Q4: What database design did you implement?
> **Answer:** "We designed a normalized relational schema with 15 tables (`users`, `papers`, `paper_authors`, `paper_chunks`, `collections`, `notes`, `highlights`, `literature_reviews`, `paper_comparisons`, etc.) managed via SQLAlchemy async ORM, allowing instant switching between local SQLite and production PostgreSQL."

### Q5: Can the system run offline without OpenAI or Gemini API keys?
> **Answer:** "Yes. The architecture includes a complete Local Grounded Deterministic NLP Engine that parses extracted chunks and synthesizes structured digests, comparative matrices, and gap reports directly from prompt context."

### Q6: How do you format citations accurately?
> **Answer:** "Our citation engine implements the official styling rules for APA 7th, IEEE, MLA 9th, Chicago 17th, BibTeX, and RIS formats, deriving metadata directly from verified author and venue fields."

### Q7: What makes this superior to tools like ChatPDF or generic ChatGPT?
> **Answer:** "ChatPDF only supports single-document chatting. ScholarPulse provides a full academic workspace: cross-paper comparison matrices, 10-category gap analysis, 10-section formal literature review generation, citation graphs, student simplifiers, and personal library management."

### Q8: What are the future enhancements planned?
> **Answer:** "Future scope includes integrating multi-modal OCR for complex mathematical equation trees, LaTeX theorem auto-verification, and real-time collaborative shared workspaces."
