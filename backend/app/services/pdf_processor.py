import pymupdf as fitz # PyMuPDF
import re
import os
from typing import Dict, List, Any, Optional

SECTION_PATTERNS = {
    "Abstract": re.compile(r"^(?:abstract|summary)\b", re.IGNORECASE),
    "Introduction": re.compile(r"^(?:1\.?|I\.?)?\s*(?:introduction|overview)\b", re.IGNORECASE),
    "Related Work": re.compile(r"^(?:2\.?|II\.?)?\s*(?:related work|literature review|background|prior work)\b", re.IGNORECASE),
    "Methodology": re.compile(r"^(?:3\.?|III\.?)?\s*(?:methodology|proposed (?:method|model|framework|approach)|methods|model architecture|system design)\b", re.IGNORECASE),
    "Datasets & Setup": re.compile(r"^(?:4\.?|IV\.?)?\s*(?:datasets?|experimental setup|data collection|benchmark datasets?|implementation details)\b", re.IGNORECASE),
    "Experiments & Results": re.compile(r"^(?:5\.?|V\.?)?\s*(?:experiments?|results|empirical evaluation|performance|findings)\b", re.IGNORECASE),
    "Discussion & Limitations": re.compile(r"^(?:6\.?|VI\.?)?\s*(?:discussion|limitations|threats to validity|error analysis)\b", re.IGNORECASE),
    "Conclusion & Future Work": re.compile(r"^(?:7\.?|VII\.?)?\s*(?:conclusion|future work|concluding remarks|summary and outlook)\b", re.IGNORECASE),
    "References": re.compile(r"^(?:references|bibliography|works cited)\b", re.IGNORECASE)
}

class PDFProcessor:
    @staticmethod
    def extract_from_path(file_path: str) -> Dict[str, Any]:
        """
        Extract text, metadata, page maps, and structured sections from a PDF file using PyMuPDF.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        doc = fitz.open(file_path)
        page_count = len(doc)
        
        raw_pages: List[Dict[str, Any]] = []
        full_text_list: List[str] = []
        
        for idx in range(page_count):
            page = doc[idx]
            page_text = page.get_text("text")
            cleaned_text = PDFProcessor.clean_text(page_text)
            raw_pages.append({
                "page_number": idx + 1,
                "text": cleaned_text
            })
            full_text_list.append(cleaned_text)
            
        doc_metadata = doc.metadata or {}
        
        # Detect sections across pages
        sections = PDFProcessor.detect_sections(raw_pages)
        
        # Extract title & abstract
        title = PDFProcessor.detect_title(raw_pages, doc_metadata.get("title", ""))
        abstract = sections.get("Abstract", {}).get("content") or PDFProcessor.detect_abstract_fallback(raw_pages)
        doi = PDFProcessor.detect_doi("\n".join(full_text_list[:2]))
        
        doc.close()
        
        return {
            "title": title,
            "page_count": page_count,
            "abstract": abstract,
            "doi": doi,
            "sections": sections,
            "pages": raw_pages,
            "full_text": "\n\n".join(full_text_list)
        }

    @staticmethod
    def clean_text(text: str) -> str:
        """Clean noise, excessive whitespace, and hyphens from PDF text."""
        if not text:
            return ""
        # Fix hyphenated line breaks (e.g. "trans- \n former" -> "transformer")
        text = re.sub(r"(\w+)-\s*\n\s*(\w+)", r"\1\2", text)
        # Normalize multiple spaces and non-breaking spaces
        text = re.sub(r"[ \t]+", " ", text)
        # Normalize multiple newlines
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    @staticmethod
    def detect_title(pages: List[Dict[str, Any]], meta_title: str) -> str:
        """Infer high-confidence paper title from the first page layout or metadata."""
        if meta_title and len(meta_title.strip()) > 6 and not meta_title.lower().endswith(".pdf"):
            return meta_title.strip()
            
        if not pages:
            return "Untitled Research Paper"
            
        first_page_lines = [line.strip() for line in pages[0]["text"].split("\n") if line.strip()]
        for line in first_page_lines[:6]:
            # Filter out arXiv headers or copyright notices
            if "arxiv:" in line.lower() or "ieee" in line.lower() or "proceedings of" in line.lower() or len(line) < 6:
                continue
            if len(line) > 10 and not line.lower().startswith("abstract"):
                return line
                
        return first_page_lines[0] if first_page_lines else "Untitled Research Paper"

    @staticmethod
    def detect_doi(header_text: str) -> Optional[str]:
        doi_match = re.search(r"10\.\d{4,9}/[-._;()/:A-Z0-9]+", header_text, re.IGNORECASE)
        if doi_match:
            return doi_match.group(0)
        return None

    @staticmethod
    def detect_abstract_fallback(pages: List[Dict[str, Any]]) -> str:
        if not pages:
            return ""
        first_page = pages[0]["text"]
        match = re.search(r"(?:abstract|summary)[:\s]+(.*?)(?=\n(?:1\.?|I\.?)?\s*introduction|\n\n\n|\Z)", first_page, re.IGNORECASE | re.DOTALL)
        if match:
            return match.group(1).strip()
        return first_page[:800].strip()

    @staticmethod
    def detect_sections(pages: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        """
        Segment the paper into standard academic sections with page tracking.
        """
        sections: Dict[str, Dict[str, Any]] = {}
        current_section = "General / Introduction"
        current_page = 1
        current_content: List[str] = []
        
        for p in pages:
            page_num = p["page_number"]
            lines = p["text"].split("\n")
            
            for line in lines:
                trimmed = line.strip()
                matched_sec = None
                
                # Check if this line is a section heading
                if len(trimmed) < 70:
                    for sec_name, pattern in SECTION_PATTERNS.items():
                        if pattern.match(trimmed):
                            matched_sec = sec_name
                            break
                            
                if matched_sec:
                    # Save previous section
                    if current_content:
                        sec_text = "\n".join(current_content).strip()
                        if current_section in sections:
                            sections[current_section]["content"] += "\n" + sec_text
                        else:
                            sections[current_section] = {
                                "content": sec_text,
                                "start_page": current_page,
                                "end_page": page_num
                            }
                    current_section = matched_sec
                    current_page = page_num
                    current_content = []
                else:
                    current_content.append(line)
                    
        # Save last section
        if current_content:
            sec_text = "\n".join(current_content).strip()
            if current_section in sections:
                sections[current_section]["content"] += "\n" + sec_text
                sections[current_section]["end_page"] = pages[-1]["page_number"] if pages else 1
            else:
                sections[current_section] = {
                    "content": sec_text,
                    "start_page": current_page,
                    "end_page": pages[-1]["page_number"] if pages else 1
                }
                
        return sections
