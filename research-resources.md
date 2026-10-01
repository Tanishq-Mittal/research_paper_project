# Verified Academic Research Paper Resources & Open-Access Indexes

This curated reference document lists legitimate, verified scientific repositories, preprint servers, open-access indexing APIs, and digital libraries for literature retrieval.

---

## 1. Open-Access Preprint & Archive Servers

### arXiv (Cornell University)
* **Domain Focus:** Computer Science, Artificial Intelligence, Machine Learning, Mathematics, Physics, Quantitative Biology.
* **Access Type:** 100% Open Access (PDFs, LaTeX sources, abstracts).
* **Official URL:** [https://arxiv.org](https://arxiv.org)
* **API / Metadata Endpoint:** [https://arxiv.org/help/api](https://arxiv.org/help/api)
* **Example Benchmark Papers:**
  - *Attention Is All You Need:* `https://arxiv.org/abs/1706.03762`
  - *LoRA: Low-Rank Adaptation of Large Language Models:* `https://arxiv.org/abs/2106.09685`
  - *Deep Residual Learning for Image Recognition:* `https://arxiv.org/abs/1512.03385`
  - *BERT: Pre-training of Deep Bidirectional Transformers:* `https://arxiv.org/abs/1810.04805`
  - *FlashAttention: Fast and Memory-Efficient Exact Attention:* `https://arxiv.org/abs/2205.14135`

### bioRxiv & medRxiv (Cold Spring Harbor Laboratory)
* **Domain Focus:** Biological Sciences, Medicine, Bioinformatics, Computational Healthcare.
* **Access Type:** Open-Access Preprints.
* **Official URL:** [https://www.biorxiv.org](https://www.biorxiv.org) / [https://www.medrxiv.org](https://www.medrxiv.org)

### PubMed Central (PMC) / NCBI
* **Domain Focus:** Biomedical and Life Sciences Literature.
* **Access Type:** Free Full-Text Archive.
* **Official URL:** [https://pmc.ncbi.nlm.nih.gov](https://pmc.ncbi.nlm.nih.gov)

---

## 2. Research Graph APIs & Citation Indexes

### Semantic Scholar (Allen Institute for AI)
* **Domain Focus:** Comprehensive Cross-Disciplinary Academic Graph (200M+ publications).
* **Access Type:** Free Graph API with author linkages, citations, abstracts, and embeddings.
* **Official URL:** [https://www.semanticscholar.org](https://www.semanticscholar.org)
* **API Documentation:** [https://api.semanticscholar.org/api-docs/graph](https://api.semanticscholar.org/api-docs/graph)
* **API Endpoint Used by ScholarPulse:** `GET https://api.semanticscholar.org/graph/v1/paper/search`

### Crossref
* **Domain Focus:** Global DOI metadata registrar for scholarly journals, conference proceedings, and datasets.
* **Access Type:** Free REST API for DOI resolution and bibtex generation.
* **Official URL:** [https://www.crossref.org](https://www.crossref.org)
* **REST API:** `https://api.crossref.org`

### Directory of Open Access Journals (DOAJ)
* **Domain Focus:** Peer-reviewed, community-curated open-access journals.
* **Access Type:** 100% Free Open Access.
* **Official URL:** [https://doaj.org](https://doaj.org)

---

## 3. Major Peer-Reviewed Publisher Repositories (Metadata & Subscription)

* **IEEE Xplore Digital Library:** [https://ieeexplore.ieee.org](https://ieeexplore.ieee.org)
* **ACM Digital Library:** [https://dl.acm.org](https://dl.acm.org)
* **ScienceDirect / Elsevier:** [https://www.sciencedirect.com](https://www.sciencedirect.com)
* **SpringerLink:** [https://link.springer.com](https://link.springer.com)
* **Google Scholar:** [https://scholar.google.com](https://scholar.google.com)

---

## 4. Citation Style Standards Guide

| Style | Field / Discipline | Formatting Standard |
| :--- | :--- | :--- |
| **APA (7th Ed.)** | Psychology, Social Sciences, Computer Science | `Author, A. A. (Year). Title. Journal, Vol(Issue), Pages. DOI` |
| **IEEE** | Engineering, Computer Science, Robotics | `[1] A. A. Author, "Title," Journal, Year.` |
| **MLA (9th Ed.)** | Humanities, Literature, Interdisciplinary Studies | `Author, First. "Title." Journal, Year.` |
| **Chicago (17th)** | History, General Sciences | `Author, First. "Title." Journal (Year).` |
| **BibTeX** | Computer Science LaTeX Compilations | `@article{key, title={...}, author={...}, year={...}}` |
| **RIS** | EndNote, Zotero, Mendeley, Paperpile | Standardized multi-line key-value reference payload |
