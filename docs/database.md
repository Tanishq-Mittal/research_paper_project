# Database Schema Documentation

ScholarPulse utilizes a normalized relational schema with 15 core tables:

```
[ users ]
   |--- 1:N ---> [ papers ]
   |                |--- 1:N ---> [ paper_authors ]
   |                |--- 1:N ---> [ paper_chunks ]
   |                |--- 1:N ---> [ notes ]
   |                |--- 1:N ---> [ highlights ]
   |                |--- M:N ---> [ collection_papers ] <--- M:N --- [ collections ]
   |--- 1:N ---> [ conversations ]
   |                |--- 1:N ---> [ messages ]
   |--- 1:N ---> [ literature_reviews ]
   |--- 1:N ---> [ paper_comparisons ]
   |--- 1:N ---> [ research_gap_analyses ]
   |--- 1:N ---> [ saved_searches ]
```

---

## Key Table Definitions

### 1. `users`
* `id` (PK, UUID String)
* `email` (Unique, indexed)
* `hashed_password` (PBKDF2-SHA256)
* `full_name`, `role`, `research_interests`, `preferred_citation_style`, `theme`, `ai_model_pref`

### 2. `papers`
* `id` (PK, UUID String)
* `user_id` (FK -> `users.id`)
* `title`, `abstract`, `publication_year`, `journal_venue`, `doi`, `url`
* `file_path`, `file_size`, `page_count`
* `keywords_json`, `scorecard_json`, `digest_json`
* `reading_status` (`Not Started`, `Started`, `Reading`, `Reviewing`, `Completed`)
* `reading_progress` (0, 25, 50, 75, 100)
* `is_favorite`, `is_demo`

### 3. `paper_chunks`
* `id` (PK, UUID String)
* `paper_id` (FK -> `papers.id`)
* `chunk_index` (Integer)
* `section_name` (Indexed, e.g. "Methodology", "Abstract")
* `page_number` (Integer)
* `content` (Text passage)
* `token_count` (Integer)

### 4. `literature_reviews`
* `id` (PK, UUID String)
* `user_id` (FK -> `users.id`)
* `title`, `topic`, `paper_ids_json`
* `content_markdown` (Full formal 10-section text)
* `structured_json` (Individual section blocks)

### 5. `paper_comparisons`
* `id` (PK, UUID String)
* `user_id` (FK -> `users.id`)
* `title`, `paper_ids_json`
* `matrix_json` (8-category comparative cell values)
* `narrative_markdown` (Synthesized differentiators)
