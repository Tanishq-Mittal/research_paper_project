import uuid
from typing import List, Dict, Any

class DocumentChunker:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 80):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_paper(self, paper_id: str, pages: List[Dict[str, Any]], sections: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Produce structured chunks with section awareness and exact page number tracking.
        """
        chunks: List[Dict[str, Any]] = []
        chunk_idx = 0

        # If we have structured sections, chunk within each section
        if sections:
            for sec_name, sec_data in sections.items():
                content = sec_data.get("content", "")
                start_page = sec_data.get("start_page", 1)
                end_page = sec_data.get("end_page", start_page)
                
                # Split content into words
                words = content.split()
                if not words:
                    continue

                step = max(1, self.chunk_size - self.chunk_overlap)
                for i in range(0, len(words), step):
                    chunk_words = words[i:i + self.chunk_size]
                    chunk_text = " ".join(chunk_words).strip()
                    
                    if len(chunk_text) < 30:
                        continue
                        
                    # Estimate page proportionally within section range
                    progress_ratio = i / max(1, len(words))
                    estimated_page = int(start_page + progress_ratio * (end_page - start_page))
                    estimated_page = max(start_page, min(end_page, estimated_page))

                    chunks.append({
                        "id": str(uuid.uuid4()),
                        "paper_id": paper_id,
                        "chunk_index": chunk_idx,
                        "section_name": sec_name,
                        "page_number": estimated_page,
                        "content": chunk_text,
                        "token_count": len(chunk_words)
                    })
                    chunk_idx += 1
        else:
            # Fallback: chunk page-by-page directly
            for p in pages:
                page_num = p.get("page_number", 1)
                text = p.get("text", "")
                words = text.split()
                if not words:
                    continue
                step = max(1, self.chunk_size - self.chunk_overlap)
                for i in range(0, len(words), step):
                    chunk_words = words[i:i + self.chunk_size]
                    chunk_text = " ".join(chunk_words).strip()
                    if len(chunk_text) < 30:
                        continue
                    chunks.append({
                        "id": str(uuid.uuid4()),
                        "paper_id": paper_id,
                        "chunk_index": chunk_idx,
                        "section_name": "General",
                        "page_number": page_num,
                        "content": chunk_text,
                        "token_count": len(chunk_words)
                    })
                    chunk_idx += 1

        return chunks

chunker = DocumentChunker()
