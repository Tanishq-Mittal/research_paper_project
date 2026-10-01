import datetime
from typing import List, Optional
from sqlalchemy import (
    Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False, default="Researcher")
    role = Column(String(50), default="Student Researcher") # Student Researcher, College Faculty, Research Scholar
    research_interests = Column(Text, default="Machine Learning, NLP, Artificial Intelligence")
    preferred_citation_style = Column(String(20), default="APA") # APA, IEEE, MLA, Chicago
    theme = Column(String(20), default="dark") # dark, light, system
    ai_model_pref = Column(String(50), default="Gemini 1.5 Pro / GPT-4o")
    default_language = Column(String(20), default="English")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    papers = relationship("Paper", back_populates="user", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    highlights = relationship("Highlight", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    literature_reviews = relationship("LiteratureReview", back_populates="user", cascade="all, delete-orphan")
    comparisons = relationship("PaperComparison", back_populates="user", cascade="all, delete-orphan")
    gaps = relationship("ResearchGapAnalysis", back_populates="user", cascade="all, delete-orphan")
    saved_searches = relationship("SavedSearch", back_populates="user", cascade="all, delete-orphan")


class Paper(Base):
    __tablename__ = "papers"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False, index=True)
    original_filename = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, default=0) # in bytes
    page_count = Column(Integer, default=1)
    
    abstract = Column(Text, nullable=True)
    publication_year = Column(Integer, nullable=True, index=True)
    journal_venue = Column(String(255), nullable=True)
    doi = Column(String(100), nullable=True, index=True)
    url = Column(String(500), nullable=True)
    citation_count = Column(Integer, default=0)
    
    keywords_json = Column(Text, default="[]") # JSON list of strings
    scorecard_json = Column(Text, default="{}") # JSON factual scorecard
    digest_json = Column(Text, default="{}") # Structured digest JSON
    
    reading_status = Column(String(30), default="Not Started") # Not Started, Started, Reading, Reviewing, Completed
    reading_progress = Column(Integer, default=0) # 0, 25, 50, 75, 100
    is_favorite = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="papers")
    authors = relationship("PaperAuthor", back_populates="paper", cascade="all, delete-orphan")
    chunks = relationship("PaperChunk", back_populates="paper", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="paper", cascade="all, delete-orphan")
    highlights = relationship("Highlight", back_populates="paper", cascade="all, delete-orphan")
    collection_links = relationship("CollectionPaper", back_populates="paper", cascade="all, delete-orphan")


class PaperAuthor(Base):
    __tablename__ = "paper_authors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    paper_id = Column(String(36), ForeignKey("papers.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    affiliation = Column(String(255), nullable=True)
    order_idx = Column(Integer, default=0)

    paper = relationship("Paper", back_populates="authors")


class PaperChunk(Base):
    __tablename__ = "paper_chunks"

    id = Column(String(36), primary_key=True, index=True)
    paper_id = Column(String(36), ForeignKey("papers.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    section_name = Column(String(100), default="General", index=True)
    page_number = Column(Integer, default=1)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    embedding_json = Column(Text, nullable=True) # Vector stored as JSON float list if needed

    paper = relationship("Paper", back_populates="chunks")


class Collection(Base):
    __tablename__ = "collections"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(30), default="#6366f1")
    icon = Column(String(50), default="folder")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="collections")
    paper_links = relationship("CollectionPaper", back_populates="collection", cascade="all, delete-orphan")


class CollectionPaper(Base):
    __tablename__ = "collection_papers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    collection_id = Column(String(36), ForeignKey("collections.id"), nullable=False, index=True)
    paper_id = Column(String(36), ForeignKey("papers.id"), nullable=False, index=True)
    added_at = Column(DateTime, default=datetime.datetime.utcnow)

    collection = relationship("Collection", back_populates="paper_links")
    paper = relationship("Paper", back_populates="collection_links")


class Note(Base):
    __tablename__ = "notes"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    paper_id = Column(String(36), ForeignKey("papers.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    tag = Column(String(50), default="General") # Important Method, Research Gap, Use in Project, Key Finding
    page_number = Column(Integer, nullable=True)
    selected_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notes")
    paper = relationship("Paper", back_populates="notes")


class Highlight(Base):
    __tablename__ = "highlights"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    paper_id = Column(String(36), ForeignKey("papers.id"), nullable=False, index=True)
    page_number = Column(Integer, default=1)
    text = Column(Text, nullable=False)
    color = Column(String(30), default="#fef08a") # yellow, green, blue, pink
    note_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="highlights")
    paper = relationship("Paper", back_populates="highlights")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    paper_id = Column(String(36), ForeignKey("papers.id"), nullable=True, index=True)
    title = Column(String(255), default="Research Paper Discussion")
    is_multi_paper = Column(Boolean, default=False)
    paper_ids_json = Column(Text, default="[]") # JSON list of string IDs for multi-paper
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    sources_json = Column(Text, default="[]") # List of { paper_id, paper_title, page, section, text_snippet }
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class LiteratureReview(Base):
    __tablename__ = "literature_reviews"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    paper_ids_json = Column(Text, nullable=False) # JSON list
    content_markdown = Column(Text, nullable=False)
    structured_json = Column(Text, default="{}") # Sections: Intro, Themes, Findings, Contradictions, Gaps, References
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="literature_reviews")


class PaperComparison(Base):
    __tablename__ = "paper_comparisons"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    paper_ids_json = Column(Text, nullable=False)
    matrix_json = Column(Text, nullable=False) # Table comparison of Problem, Dataset, Method, Model, Results, Limitations
    narrative_markdown = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="comparisons")


class ResearchGapAnalysis(Base):
    __tablename__ = "research_gap_analyses"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    paper_ids_json = Column(Text, nullable=False)
    gaps_json = Column(Text, nullable=False) # Array of gap objects with evidence + proposed direction
    synthesis_markdown = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="gaps")


class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    query = Column(String(500), nullable=False)
    filters_json = Column(Text, default="{}")
    result_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="saved_searches")
