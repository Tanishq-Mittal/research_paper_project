from typing import List, Dict, Any, Optional
from app.rag.embeddings import embedding_engine
from app.rag.vector_store import vector_store
from app.schemas.schemas import ChunkSource

class RAGRetriever:
    @staticmethod
    def retrieve_context(
        query: str,
        paper_ids: List[str],
        paper_titles: Dict[str, str],
        top_k: int = 5,
        section_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieve grounded evidence chunks for a user question across one or more papers.
        """
        # Collect candidate text context for query embedding
        all_texts = []
        for pid in paper_ids:
            if pid in vector_store.indices:
                all_texts.extend([c["content"] for c in vector_store.indices[pid][:10]])
                
        query_vec = embedding_engine.embed_query(query, context_texts=all_texts if all_texts else None)
        
        raw_results = vector_store.search(
            query_vector=query_vec,
            paper_ids=paper_ids,
            top_k=top_k,
            section_filter=section_filter
        )
        
        sources: List[ChunkSource] = []
        context_blocks = []
        
        for idx, res in enumerate(raw_results):
            p_id = res["paper_id"]
            p_title = paper_titles.get(p_id, "Unknown Paper")
            page = res.get("page_number", 1)
            section = res.get("section_name", "General")
            snippet = res.get("content", "")
            sim = res.get("similarity_score", 0.0)
            
            sources.append(ChunkSource(
                paper_id=p_id,
                paper_title=p_title,
                page=page,
                section=section,
                snippet=snippet[:300] + ("..." if len(snippet) > 300 else ""),
                similarity_score=sim
            ))
            
            context_blocks.append(
                f"[Source {idx+1}]: Paper: \"{p_title}\" | Section: {section} | Page: {page}\nContent: {snippet}"
            )
            
        return {
            "sources": sources,
            "context_text": "\n\n".join(context_blocks),
            "raw_chunks": raw_results
        }

retriever = RAGRetriever()
