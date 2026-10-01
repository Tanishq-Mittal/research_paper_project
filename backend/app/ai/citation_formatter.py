from typing import Dict, Any, List

class CitationFormatter:
    @staticmethod
    def format_citations(paper: Dict[str, Any]) -> Dict[str, str]:
        """
        Format citations for a paper into APA, IEEE, MLA, Chicago, BibTeX, and RIS.
        """
        title = paper.get("title", "Untitled Paper")
        year = paper.get("publication_year") or 2023
        venue = paper.get("journal_venue") or "arXiv Preprint"
        doi = paper.get("doi") or ""
        url = paper.get("url") or ""
        
        authors_raw = paper.get("authors", [])
        author_names = []
        for a in authors_raw:
            if isinstance(a, dict):
                author_names.append(a.get("name", ""))
            else:
                author_names.append(str(a))
        if not author_names:
            author_names = ["Anonymous Researcher"]

        # APA Format: Author, A. A., & Author, B. B. (Year). Title. Venue. DOI/URL
        apa_authors = CitationFormatter._format_authors_apa(author_names)
        apa = f"{apa_authors} ({year}). {title}. *{venue}*."
        if doi:
            apa += f" https://doi.org/{doi}"
        elif url:
            apa += f" {url}"

        # IEEE Format: [1] A. A. Author and B. B. Author, "Title," Venue, Year.
        ieee_authors = CitationFormatter._format_authors_ieee(author_names)
        ieee = f"{ieee_authors}, \"{title},\" *{venue}*, {year}."
        if doi:
            ieee += f" doi: {doi}."

        # MLA Format: Author, Author. "Title." Venue, Year.
        mla_authors = CitationFormatter._format_authors_mla(author_names)
        mla = f"{mla_authors}. \"{title}.\" *{venue}*, {year}."
        if url:
            mla += f" {url}."

        # Chicago Format: Author, First. "Title." Venue (Year).
        chicago = f"{apa_authors}. \"{title}.\" *{venue}* ({year})."
        if doi:
            chicago += f" https://doi.org/{doi}."

        # BibTeX
        bib_key = CitationFormatter._make_bibtex_key(author_names[0], year, title)
        bib_authors = " and ".join(author_names)
        bibtex = (
            f"@article{{{bib_key},\n"
            f"  title = {{{title}}},\n"
            f"  author = {{{bib_authors}}},\n"
            f"  journal = {{{venue}}},\n"
            f"  year = {{{year}}}"
        )
        if doi:
            bibtex += f",\n  doi = {{{doi}}}"
        if url:
            bibtex += f",\n  url = {{{url}}}"
        bibtex += "\n}"

        # RIS Format
        ris_lines = [
            "TY  - JOUR",
            f"TI  - {title}"
        ]
        for a in author_names:
            ris_lines.append(f"AU  - {a}")
        ris_lines.extend([
            f"JO  - {venue}",
            f"PY  - {year}",
        ])
        if doi:
            ris_lines.append(f"DO  - {doi}")
        if url:
            ris_lines.append(f"UR  - {url}")
        ris_lines.append("ER  - ")
        ris = "\n".join(ris_lines)

        return {
            "APA": apa,
            "IEEE": ieee,
            "MLA": mla,
            "Chicago": chicago,
            "BibTeX": bibtex,
            "RIS": ris
        }

    @staticmethod
    def _format_authors_apa(names: List[str]) -> str:
        if not names:
            return "Anonymous"
        formatted = []
        for n in names:
            parts = n.strip().split()
            if len(parts) > 1:
                last = parts[-1]
                initials = " ".join([p[0].upper() + "." for p in parts[:-1]])
                formatted.append(f"{last}, {initials}")
            else:
                formatted.append(n)
        if len(formatted) == 1:
            return formatted[0]
        elif len(formatted) == 2:
            return f"{formatted[0]}, & {formatted[1]}"
        elif len(formatted) <= 7:
            return ", ".join(formatted[:-1]) + f", & {formatted[-1]}"
        else:
            return ", ".join(formatted[:6]) + " ... " + formatted[-1]

    @staticmethod
    def _format_authors_ieee(names: List[str]) -> str:
        if not names:
            return "Anon."
        formatted = []
        for n in names:
            parts = n.strip().split()
            if len(parts) > 1:
                initials = ". ".join([p[0].upper() for p in parts[:-1]]) + "."
                last = parts[-1]
                formatted.append(f"{initials} {last}")
            else:
                formatted.append(n)
        if len(formatted) == 1:
            return formatted[0]
        elif len(formatted) == 2:
            return f"{formatted[0]} and {formatted[1]}"
        else:
            return f"{formatted[0]} et al."

    @staticmethod
    def _format_authors_mla(names: List[str]) -> str:
        if not names:
            return "Anonymous"
        if len(names) == 1:
            parts = names[0].split()
            return f"{parts[-1]}, {' '.join(parts[:-1])}" if len(parts) > 1 else names[0]
        elif len(names) == 2:
            p1 = names[0].split()
            a1 = f"{p1[-1]}, {' '.join(p1[:-1])}" if len(p1) > 1 else names[0]
            return f"{a1}, and {names[1]}"
        else:
            p1 = names[0].split()
            a1 = f"{p1[-1]}, {' '.join(p1[:-1])}" if len(p1) > 1 else names[0]
            return f"{a1}, et al."

    @staticmethod
    def _make_bibtex_key(first_author: str, year: int, title: str) -> str:
        last = first_author.split()[-1].lower() if first_author else "author"
        clean_last = "".join(filter(str.isalnum, last))
        words = [w.lower() for w in title.split() if w.lower() not in ["the", "a", "an", "on", "for", "in", "of", "and"]]
        first_word = "".join(filter(str.isalnum, words[0])) if words else "paper"
        return f"{clean_last}{year}{first_word}"

citation_formatter = CitationFormatter()
