# RAG Pipeline & AI Architecture Documentation

## 1. RAG Workflow

```
PDF / Document
      |
      v
PyMuPDF Text Extraction & Cleaning
      |
      v
Academic Section Classifier (Abstract, Intro, Methods, Results, Limitations)
      |
      v
Section-Bounded Sliding Window Chunking (500 tokens, 80-token overlap)
      |
      v
Dense Embedding Generation (all-MiniLM-L6-v2 / Scikit-learn TF-IDF)
      |
      v
Vector Store Indexing (Unit-Normalized 384-dimensional space)
      |
      v
User Question / Topic Query
      |
      v
Query Embedding & Cosine Similarity Dot Product Search (Top-K)
      |
      v
Context Selection with Section & Page Badges
      |
      v
LLM Router (Gemini 1.5 Pro / GPT-4o / Grounded NLP Synthesis)
      |
      v
Verifiable Answer with Exact Evidence Excerpt & Page Badges
```

---

## 2. No-Hallucination Guardrails
To prevent models from making up benchmark numbers or citations:
1. **Context Constrained Prompting:** The LLM is instructed: *"Answer ONLY using the provided retrieved excerpts. If evidence is absent, state: 'I couldn't find sufficient evidence for this in the uploaded paper.'"*
2. **Citation Provenance:** Every response returned includes an array of `ChunkSource` objects with `paper_title`, `section`, `page`, and `similarity_score`.
3. **Deterministic Grounded Fallback:** If external API keys are unavailable, our deterministic extraction engine parses retrieved sentences matching query terms without probabilistic fabrication.
