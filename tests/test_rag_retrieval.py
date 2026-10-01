import pytest
from app.rag.embeddings import embedding_engine
from app.rag.vector_store import vector_store
from app.rag.retriever import retriever
from app.ai.citation_formatter import citation_formatter
from app.ai.gap_detector import gap_detector
from app.ai.simplifier import simplifier

def test_embedding_vector_dimensions():
    texts = ["Transformer self-attention architecture", "Low-rank adaptation of LLMs"]
    embs = embedding_engine.embed_texts(texts)
    assert len(embs) == 2
    assert embs.shape[1] == 384

def test_citation_formatter_all_styles():
    paper = {
        "title": "Attention Is All You Need",
        "authors": [{"name": "Ashish Vaswani"}, {"name": "Noam Shazeer"}],
        "publication_year": 2017,
        "journal_venue": "NeurIPS",
        "doi": "10.48550/arXiv.1706.03762"
    }
    citations = citation_formatter.format_citations(paper)
    assert "APA" in citations
    assert "IEEE" in citations
    assert "MLA" in citations
    assert "Chicago" in citations
    assert "BibTeX" in citations
    assert "RIS" in citations
    assert "Vaswani" in citations["APA"]
    assert "2017" in citations["IEEE"]

def test_gap_detector_categories():
    papers = [{
        "id": "p1",
        "title": "Attention Is All You Need",
        "abstract": "Proposes transformer models based solely on attention mechanisms."
    }]
    res = gap_detector.analyze_gaps(papers)
    assert len(res["gaps"]) >= 4
    categories = [g["category"] for g in res["gaps"]]
    assert "Scalability gap" in categories
    assert "Generalization gap" in categories
