# AI Models & Machine Learning Reference

## 1. Supported Embedding Models
* **Default:** `all-MiniLM-L6-v2` (Sentence Transformers, 384-dimensional dense vectors)
* **High-Accuracy Biomedical / CS Alternative:** `allenai/specter` (Scientific paper embeddings)
* **Fallback:** Scikit-Learn TF-IDF N-gram Matrix (Zero network download needed, instant offline operation).

---

## 2. LLM Providers
* **Google Gemini 1.5 Pro & 1.5 Flash:** High-speed, large context window (1M+ tokens), ideal for synthesizing entire 50-page literature corpora.
* **OpenAI GPT-4o & GPT-4o-mini:** Superior reasoning and structured JSON output.
* **Local Deterministic Fallback Engine:** Grounded extraction engine that parses chunks directly.

---

## 3. Machine Learning Analytical Components
* **Cosine Similarity Scoring:** Fast vector dot products between normalized unit query vectors and document chunk embeddings.
* **TF-IDF & Character N-grams:** Fuzzy term matching for semantic discovery.
* **Scorecard Extractors:** Regex heuristics for metric reporting verification.
