import numpy as np
from typing import List, Dict, Any, Optional
import json
import logging

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        # Map: paper_id -> list of chunk dicts with embeddings
        self.indices: Dict[str, List[Dict[str, Any]]] = {}

    def add_chunks(self, paper_id: str, chunks: List[Dict[str, Any]], embeddings: np.ndarray):
        if paper_id not in self.indices:
            self.indices[paper_id] = []
            
        for i, chunk in enumerate(chunks):
            emb = embeddings[i] if i < len(embeddings) else np.zeros(384)
            chunk_copy = dict(chunk)
            chunk_copy["vector"] = emb
            self.indices[paper_id].append(chunk_copy)

    def search(
        self,
        query_vector: np.ndarray,
        paper_ids: Optional[List[str]] = None,
        top_k: int = 5,
        section_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        candidate_chunks: List[Dict[str, Any]] = []
        
        target_papers = paper_ids if paper_ids else list(self.indices.keys())
        for pid in target_papers:
            if pid in self.indices:
                candidate_chunks.extend(self.indices[pid])
                
        if not candidate_chunks:
            return []

        if section_filter:
            filtered = [c for c in candidate_chunks if section_filter.lower() in c.get("section_name", "").lower()]
            if filtered:
                candidate_chunks = filtered

        # Cosine similarity
        scores = []
        for c in candidate_chunks:
            vec = c.get("vector")
            if vec is not None:
                # Dot product between normalized vectors
                sim = float(np.dot(query_vector, vec))
            else:
                sim = 0.0
            scores.append(sim)

        scored_pairs = list(zip(scores, candidate_chunks))
        scored_pairs.sort(key=lambda x: x[0], reverse=True)

        results = []
        for score, chunk in scored_pairs[:top_k]:
            res = dict(chunk)
            res["similarity_score"] = round(float(score), 4)
            if "vector" in res:
                del res["vector"]
            results.append(res)

        return results

    def remove_paper(self, paper_id: str):
        if paper_id in self.indices:
            del self.indices[paper_id]

vector_store = VectorStore()
