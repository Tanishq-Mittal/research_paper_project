export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  research_interests: string;
  preferred_citation_style: string;
  theme: 'dark' | 'light' | 'system';
  ai_model_pref: string;
  default_language: string;
  created_at: string;
}

export interface PaperAuthor {
  name: string;
  affiliation?: string;
  order_idx: number;
}

export interface ScorecardMetrics {
  citation_count: number;
  publication_year?: number;
  dataset_reported: boolean;
  dataset_name?: string;
  experiments_count: number;
  metrics_reported: string[];
  is_open_access: boolean;
  references_count: number;
}

export interface StructuredDigest {
  executive_summary: string;
  research_problem: string;
  motivation: string;
  methodology_steps: string[];
  dataset_details: {
    name: string;
    samples_count: string;
    train_test_split: string;
    source: string;
  };
  algorithms_and_models: string[];
  results_and_metrics: Record<string, string>;
  limitations: string[];
  future_work: string[];
}

export interface Paper {
  id: string;
  user_id: string;
  title: string;
  original_filename?: string;
  file_path?: string;
  file_size: number;
  page_count: number;
  abstract?: string;
  publication_year?: number;
  journal_venue?: string;
  doi?: string;
  url?: string;
  citation_count: number;
  keywords: string[];
  scorecard?: ScorecardMetrics;
  digest?: StructuredDigest;
  reading_status: 'Not Started' | 'Started' | 'Reading' | 'Reviewing' | 'Completed';
  reading_progress: number;
  is_favorite: boolean;
  is_demo: boolean;
  authors: PaperAuthor[];
  created_at: string;
  updated_at: string;
}

export interface ChunkSource {
  paper_id: string;
  paper_title: string;
  page: number;
  section: string;
  snippet: string;
  similarity_score?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: ChunkSource[];
  created_at: string;
}

export interface SimplifyResponse {
  level: 'Beginner' | 'Intermediate' | 'Technical';
  original_text: string;
  simplified_explanation: string;
  analogies: string[];
  key_takeaway: string;
}

export interface ComparisonMatrixCell {
  paper_id: string;
  paper_title: string;
  value: string;
  evidence_snippet?: string;
}

export interface ComparisonMatrixRow {
  category: string;
  cells: ComparisonMatrixCell[];
}

export interface PaperComparison {
  id: string;
  title: string;
  paper_ids: string[];
  matrix: ComparisonMatrixRow[];
  narrative_markdown: string;
  key_differentiators: string[];
  created_at: string;
}

export interface ResearchGapItem {
  category: string;
  gap_title: string;
  evidence_from_papers: Array<{
    paper_title: string;
    page: number;
    excerpt: string;
  }>;
  potential_research_direction: string;
  impact_level: 'High' | 'Medium' | 'Moderate';
}

export interface ResearchGapResponse {
  id: string;
  title: string;
  paper_ids: string[];
  gaps: ResearchGapItem[];
  synthesis_markdown: string;
  recommended_next_steps: string[];
  created_at: string;
}

export interface LiteratureReviewResponse {
  id: string;
  title: string;
  topic: string;
  paper_ids: string[];
  content_markdown: string;
  structured_sections: Record<string, any>;
  formatted_references: string[];
  created_at: string;
}

export interface ResearchIdeaItem {
  title: string;
  problem_statement: string;
  motivation: string;
  proposed_approach: string;
  suggested_dataset: string;
  expected_contribution: string;
  related_paper_titles: string[];
  possible_challenges: string[];
}

export interface IdeaResponse {
  ideas: ResearchIdeaItem[];
  methodology_framework: string;
}

export interface QuestionItem {
  research_question: string;
  hypothesis: string;
  independent_variables: string[];
  dependent_variables: string[];
  suggested_methodology: string;
}

export interface QuestionsResponse {
  questions: QuestionItem[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  paper_count: number;
  papers: Paper[];
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  paper_id?: string;
  paper_title?: string;
  title: string;
  content: string;
  tag: string;
  page_number?: number;
  selected_text?: string;
  created_at: string;
  updated_at: string;
}

export interface Highlight {
  id: string;
  paper_id: string;
  page_number: number;
  text: string;
  color: string;
  note_text?: string;
  created_at: string;
}

export interface CitationFormat {
  paper_id: string;
  paper_title: string;
  citations: {
    APA: string;
    IEEE: string;
    MLA: string;
    Chicago: string;
    BibTeX: string;
    RIS: string;
  };
}

export interface SearchResultItem {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year?: number;
  venue?: string;
  citation_count: number;
  url?: string;
  doi?: string;
  is_in_library: boolean;
  similarity_score: number;
}

export interface AnalyticsData {
  total_papers: number;
  total_notes: number;
  total_collections: number;
  total_reviews: number;
  reading_streak_days: number;
  reading_status_breakdown: Record<string, number>;
  topics_distribution: Array<{ topic: string; count: number; paper_ids: string[] }>;
  year_trends: Array<{ year: number; count: number }>;
  top_venues: Array<{ venue: string; count: number }>;
  frequent_algorithms: Array<{ algorithm: string; count: number }>;
  common_datasets: Array<{ dataset: string; count: number }>;
  ai_insights: string[];
}
