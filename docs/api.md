# API Reference Documentation

All endpoints are prefixed with `/api/v1`.

---

## Authentication (`/auth`)
* `POST /auth/register`: Register new user account.
* `POST /auth/login`: Authenticate and receive JWT bearer token.
* `GET /auth/me`: Get current authenticated user profile.
* `PATCH /auth/profile`: Update user name, role, interests, citation style, theme.
* `POST /auth/forgot-password`: Mock password reset trigger.

---

## Papers (`/papers`)
* `GET /papers`: List all user papers with status and favorite filters.
* `POST /papers/upload`: Upload PDF file, extract text via PyMuPDF, segment sections, index vectors, generate structured digest.
* `GET /papers/{id}`: Detailed paper metadata, sections, scorecard, digest.
* `PATCH /papers/{id}`: Update reading status, progress %, favorite flag.
* `DELETE /papers/{id}`: Delete paper and remove vector embeddings.
* `POST /papers/{id}/simplify`: Generate student explanation (Beginner, Intermediate, Technical).
* `GET /papers/{id}/chunks`: Retrieve token-bounded chunks with page numbers.

---

## Chat & RAG QA (`/chat`)
* `POST /chat/paper/{paper_id}`: Grounded single-paper RAG QA with exact section and page citation badges.
* `POST /chat/multi-paper`: Multi-paper cross-synthesis RAG QA.

---

## Comparative Synthesis (`/compare`)
* `POST /compare`: Generate 8-dimension comparative feature matrix and narrative.

---

## Literature Reviews (`/literature-review`)
* `POST /literature-review/generate`: Synthesize comprehensive 10-section literature review with APA/IEEE bibliography.
* `GET /literature-review`: List past synthesized reviews.

---

## Research Gaps (`/research-gap`)
* `POST /research-gap/analyze`: Analyze literature across 10 academic research gap categories.

---

## Research Ideation (`/ideas`)
* `POST /ideas/generate`: Brainstorm project proposals and ablation frameworks.
* `POST /ideas/questions`: Generate formal research questions, hypotheses, and variables.

---

## Collections (`/collections`)
* `GET /collections`: List user collection folders.
* `POST /collections`: Create new collection.
* `DELETE /collections/{id}`: Delete collection folder.
* `POST /collections/{id}/papers`: Add papers to collection.

---

## Notes & Highlights (`/notes`, `/highlights`)
* `GET /notes`: List research notes with tag filter.
* `POST /notes`: Create note linked to paper and page number.
* `DELETE /notes/{id}`: Delete note.
* `POST /highlights`: Save highlighted passage with color tag.

---

## Citations (`/citations`)
* `POST /citations/generate`: Generate APA, IEEE, MLA, Chicago, BibTeX, and RIS citations.

---

## Search & Discovery (`/search`)
* `GET /search`: Semantic search across library and Semantic Scholar Graph.
* `GET /search/related/{paper_id}`: Find related papers.

---

## Analytics & Visuals (`/analytics`)
* `GET /analytics`: Retrieve bibliometric charts, reading streaks, topic distribution, venue counts.

---

## Export (`/export`)
* `POST /export/download`: Export document as PDF, DOCX, Markdown, or TXT.

---

## Admin Telemetry (`/admin`)
* `GET /admin/stats`: Get developer metrics, storage usage, and API latency.
