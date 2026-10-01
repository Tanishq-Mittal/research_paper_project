import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# --- Auth & User ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "Student Researcher"
    research_interests: Optional[str] = "Machine Learning, NLP"
    preferred_citation_style: Optional[str] = "APA"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    research_interests: Optional[str] = None
    preferred_citation_style: Optional[str] = None
    theme: Optional[str] = None
    ai_model_pref: Optional[str] = None
    default_language: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    research_interests: str
    preferred_citation_style: str
    theme: str
    ai_model_pref: str
    default_language: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Paper & Metadata ---
class PaperAuthorResponse(BaseModel):
    name: str
    affiliation: Optional[str] = None
    order_idx: int = 0

class ScorecardMetrics(BaseModel):
    citation_count: int = 0
    publication_year: Optional[int] = None
    dataset_reported: bool = True
    dataset_name: Optional[str] = "Standard Benchmark"
    experiments_count: int = 1
    metrics_reported: List[str] = []
    is_open_access: bool = True
    references_count: int = 0

class StructuredDigest(BaseModel):
    executive_summary: str
    research_problem: str
    motivation: str
    methodology_steps: List[str]
    dataset_details: Dict[str, Any]
    algorithms_and_models: List[str]
    results_and_metrics: Dict[str, str]
    limitations: List[str]
    future_work: List[str]

class PaperResponse(BaseModel):
    id: str
    user_id: str
    title: str
    original_filename: Optional[str] = None
    file_path: Optional[str] = None
    file_size: int = 0
    page_count: int = 1
    abstract: Optional[str] = None
    publication_year: Optional[int] = None
    journal_venue: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    citation_count: int = 0
    keywords: List[str] = []
    scorecard: Optional[Dict[str, Any]] = None
    digest: Optional[Dict[str, Any]] = None
    reading_status: str = "Not Started"
    reading_progress: int = 0
    is_favorite: bool = False
    is_demo: bool = False
    authors: List[PaperAuthorResponse] = []
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class PaperUpdate(BaseModel):
    reading_status: Optional[str] = None
    reading_progress: Optional[int] = None
    is_favorite: Optional[bool] = None
    title: Optional[str] = None

class PaperUploadResponse(BaseModel):
    message: str
    paper: PaperResponse
    processing_steps: List[str]


# --- Chunks & RAG ---
class ChunkSource(BaseModel):
    paper_id: str
    paper_title: str
    page: int
    section: str
    snippet: str
    similarity_score: Optional[float] = None

class PaperChunkResponse(BaseModel):
    id: str
    paper_id: str
    chunk_index: int
    section_name: str
    page_number: int
    content: str
    token_count: int

    class Config:
        from_attributes = True


# --- Chat & QA ---
class ChatMessageCreate(BaseModel):
    question: str
    conversation_id: Optional[str] = None
    mode: Optional[str] = "grounded" # grounded, creative, student

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    sources: List[ChunkSource] = []
    created_at: datetime.datetime

class ConversationResponse(BaseModel):
    id: str
    title: str
    paper_id: Optional[str] = None
    is_multi_paper: bool = False
    paper_ids: List[str] = []
    messages: List[MessageResponse] = []
    created_at: datetime.datetime

class MultiPaperChatRequest(BaseModel):
    paper_ids: List[str]
    question: str
    conversation_id: Optional[str] = None


# --- Explainer / Simplify ---
class SimplifyRequest(BaseModel):
    level: str = "Beginner" # Beginner, Intermediate, Technical
    selected_text: Optional[str] = None
    concept: Optional[str] = None

class SimplifyResponse(BaseModel):
    level: str
    original_text: str
    simplified_explanation: str
    analogies: List[str] = []
    key_takeaway: str


# --- Comparison ---
class CompareRequest(BaseModel):
    paper_ids: List[str]
    title: Optional[str] = "Multi-Paper Comparative Analysis"

class ComparisonMatrixCell(BaseModel):
    paper_id: str
    paper_title: str
    value: str
    evidence_snippet: Optional[str] = None

class ComparisonMatrixRow(BaseModel):
    category: str # Problem, Dataset, Method, Model, Metrics, Results, Limitations, Future Work
    cells: List[ComparisonMatrixCell]

class PaperComparisonResponse(BaseModel):
    id: str
    title: str
    paper_ids: List[str]
    matrix: List[ComparisonMatrixRow]
    narrative_markdown: str
    key_differentiators: List[str]
    created_at: datetime.datetime


# --- Research Gaps ---
class ResearchGapRequest(BaseModel):
    paper_ids: List[str]
    focus_topic: Optional[str] = None

class ResearchGapItem(BaseModel):
    category: str # Dataset, Methodology, Geographic, Population, Performance, Generalization, Explainability, Scalability, Data Availability, Evaluation
    gap_title: str
    evidence_from_papers: List[Dict[str, Any]] # { paper_title, page, excerpt }
    potential_research_direction: str
    impact_level: str = "High" # High, Medium, Moderate

class ResearchGapResponse(BaseModel):
    id: str
    title: str
    paper_ids: List[str]
    gaps: List[ResearchGapItem]
    synthesis_markdown: str
    recommended_next_steps: List[str]
    created_at: datetime.datetime


# --- Literature Review ---
class LiteratureReviewRequest(BaseModel):
    paper_ids: List[str]
    topic: str
    custom_instructions: Optional[str] = None

class LiteratureReviewResponse(BaseModel):
    id: str
    title: str
    topic: str
    paper_ids: List[str]
    content_markdown: str
    structured_sections: Dict[str, Any]
    formatted_references: List[str]
    created_at: datetime.datetime


# --- Research Ideas & Hypotheses ---
class IdeaGenerateRequest(BaseModel):
    paper_ids: List[str]
    interest_area: Optional[str] = None

class ResearchIdeaItem(BaseModel):
    title: str
    problem_statement: str
    motivation: str
    proposed_approach: str
    suggested_dataset: str
    expected_contribution: str
    related_paper_titles: List[str]
    possible_challenges: List[str]

class IdeaResponse(BaseModel):
    ideas: List[ResearchIdeaItem]
    methodology_framework: str

class QuestionGenerateRequest(BaseModel):
    paper_ids: List[str]

class QuestionItem(BaseModel):
    research_question: str
    hypothesis: str
    independent_variables: List[str]
    dependent_variables: List[str]
    suggested_methodology: str

class QuestionsResponse(BaseModel):
    questions: List[QuestionItem]


# --- Collections ---
class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#6366f1"
    icon: Optional[str] = "folder"
    paper_ids: Optional[List[str]] = []

class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None

class CollectionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    color: str
    icon: str
    paper_count: int = 0
    papers: List[PaperResponse] = []
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Notes & Highlights ---
class NoteCreate(BaseModel):
    paper_id: Optional[str] = None
    title: str
    content: str
    tag: Optional[str] = "General"
    page_number: Optional[int] = None
    selected_text: Optional[str] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tag: Optional[str] = None

class NoteResponse(BaseModel):
    id: str
    paper_id: Optional[str] = None
    paper_title: Optional[str] = None
    title: str
    content: str
    tag: str
    page_number: Optional[int] = None
    selected_text: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class HighlightCreate(BaseModel):
    paper_id: str
    page_number: int = 1
    text: str
    color: Optional[str] = "#fef08a"
    note_text: Optional[str] = None

class HighlightResponse(BaseModel):
    id: str
    paper_id: str
    page_number: int
    text: str
    color: str
    note_text: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Citations ---
class CitationItem(BaseModel):
    style: str # APA, IEEE, MLA, Chicago, BibTeX, RIS
    formatted_text: str

class CitationGenerateRequest(BaseModel):
    paper_ids: List[str]
    style: Optional[str] = "APA"

class CitationFormatResponse(BaseModel):
    paper_id: str
    paper_title: str
    citations: Dict[str, str] # { "APA": "...", "IEEE": "...", "MLA": "...", "Chicago": "...", "BibTeX": "...", "RIS": "..." }


# --- Search & Discovery ---
class SemanticSearchRequest(BaseModel):
    query: str
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    open_access_only: bool = False
    source: str = "all" # library, semantic_scholar, all

class SearchResultItem(BaseModel):
    id: str
    title: str
    authors: List[str]
    abstract: str
    year: Optional[int] = None
    venue: Optional[str] = None
    citation_count: int = 0
    url: Optional[str] = None
    doi: Optional[str] = None
    is_in_library: bool = False
    similarity_score: float = 0.0


# --- Analytics & Visuals ---
class TopicCluster(BaseModel):
    topic: str
    count: int
    paper_ids: List[str]

class YearTrend(BaseModel):
    year: int
    count: int

class AnalyticsResponse(BaseModel):
    total_papers: int
    total_notes: int
    total_collections: int
    total_reviews: int
    reading_streak_days: int
    reading_status_breakdown: Dict[str, int]
    topics_distribution: List[TopicCluster]
    year_trends: List[YearTrend]
    top_venues: List[Dict[str, Any]]
    frequent_algorithms: List[Dict[str, Any]]
    common_datasets: List[Dict[str, Any]]
    ai_insights: List[str]
