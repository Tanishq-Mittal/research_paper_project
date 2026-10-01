import {
  User, Paper, StructuredDigest, SimplifyResponse, ChatMessage,
  PaperComparison, ResearchGapResponse, LiteratureReviewResponse,
  IdeaResponse, QuestionsResponse, Collection, Note, Highlight,
  CitationFormat, SearchResultItem, AnalyticsData
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('scholarpulse_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMessage = `Error ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.detail) {
        errMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // --- Auth ---
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(data: { email: string; password: string; full_name: string; role?: string; research_interests?: string }): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  // --- Papers ---
  async getPapers(params?: { reading_status?: string; is_favorite?: boolean; collection_id?: string }): Promise<Paper[]> {
    const query = new URLSearchParams();
    if (params?.reading_status) query.append('reading_status', params.reading_status);
    if (params?.is_favorite !== undefined) query.append('is_favorite', String(params.is_favorite));
    if (params?.collection_id) query.append('collection_id', params.collection_id);

    const res = await fetch(`${API_BASE}/papers?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getPaper(id: string): Promise<Paper> {
    const res = await fetch(`${API_BASE}/papers/${id}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async uploadPaper(file: File, title?: string): Promise<{ message: string; paper: Paper; processing_steps: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    const res = await fetch(`${API_BASE}/papers/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return handleResponse(res);
  },

  async updatePaper(id: string, updates: Partial<Paper>): Promise<Paper> {
    const res = await fetch(`${API_BASE}/papers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  async deletePaper(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/papers/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async simplifyContent(paperId: string, level: string, selectedText?: string, concept?: string): Promise<SimplifyResponse> {
    const res = await fetch(`${API_BASE}/papers/${paperId}/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ level, selected_text: selectedText, concept })
    });
    return handleResponse(res);
  },

  // --- Chat & QA ---
  async chatWithPaper(paperId: string, question: string, conversationId?: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/chat/paper/${paperId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ question, conversation_id: conversationId })
    });
    return handleResponse(res);
  },

  async chatMultiPaper(paperIds: string[], question: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/chat/multi-paper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ paper_ids: paperIds, question })
    });
    return handleResponse(res);
  },

  // --- Comparison ---
  async comparePapers(paperIds: string[], title?: string): Promise<PaperComparison> {
    const res = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ paper_ids: paperIds, title })
    });
    return handleResponse(res);
  },

  // --- Literature Reviews ---
  async generateLiteratureReview(paperIds: string[], topic: string, customInstructions?: string): Promise<LiteratureReviewResponse> {
    const res = await fetch(`${API_BASE}/literature-review/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ paper_ids: paperIds, topic, custom_instructions: customInstructions })
    });
    return handleResponse(res);
  },

  async getLiteratureReviews(): Promise<LiteratureReviewResponse[]> {
    const res = await fetch(`${API_BASE}/literature-review`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // --- Research Gaps ---
  async analyzeResearchGaps(paperIds: string[], focusTopic?: string): Promise<ResearchGapResponse> {
    const res = await fetch(`${API_BASE}/research-gap/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ paper_ids: paperIds, focus_topic: focusTopic })
    });
    return handleResponse(res);
  },

  async getResearchGaps(): Promise<ResearchGapResponse[]> {
    const res = await fetch(`${API_BASE}/research-gap`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // --- Research Ideas & Hypotheses ---
  async generateResearchIdeas(paperIds: string[], interestArea?: string): Promise<IdeaResponse> {
    const res = await fetch(`${API_BASE}/ideas/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ paper_ids: paperIds, interest_area: interestArea })
    });
    return handleResponse(res);
  },

  async generateQuestions(paperIds: string[]): Promise<QuestionsResponse> {
    const res = await fetch(`${API_BASE}/ideas/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ paper_ids: paperIds })
    });
    return handleResponse(res);
  },

  // --- Collections ---
  async getCollections(): Promise<Collection[]> {
    const res = await fetch(`${API_BASE}/collections`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createCollection(name: string, description?: string, color?: string, icon?: string, paperIds?: string[]): Promise<Collection> {
    const res = await fetch(`${API_BASE}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ name, description, color, icon, paper_ids: paperIds })
    });
    return handleResponse(res);
  },

  async deleteCollection(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/collections/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async addPapersToCollection(collectionId: string, paperIds: string[]): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/collections/${collectionId}/papers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ paper_ids: paperIds })
    });
    return handleResponse(res);
  },

  // --- Notes & Highlights ---
  async getNotes(paperId?: string, tag?: string): Promise<Note[]> {
    const query = new URLSearchParams();
    if (paperId) query.append('paper_id', paperId);
    if (tag) query.append('tag', tag);

    const res = await fetch(`${API_BASE}/notes?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createNote(data: { paper_id?: string; title: string; content: string; tag?: string; page_number?: number; selected_text?: string }): Promise<Note> {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteNote(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createHighlight(data: { paper_id: string; page_number: number; text: string; color?: string; note_text?: string }): Promise<Highlight> {
    const res = await fetch(`${API_BASE}/highlights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getHighlights(paperId: string): Promise<Highlight[]> {
    const res = await fetch(`${API_BASE}/papers/${paperId}/highlights`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // --- Citations ---
  async generateCitations(paperIds: string[]): Promise<CitationFormat[]> {
    const res = await fetch(`${API_BASE}/citations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ paper_ids: paperIds })
    });
    return handleResponse(res);
  },

  // --- Search & Discovery ---
  async searchPapers(query: string, source: string = 'all', yearMin?: number, yearMax?: number): Promise<SearchResultItem[]> {
    const params = new URLSearchParams({ query, source });
    if (yearMin) params.append('year_min', String(yearMin));
    if (yearMax) params.append('year_max', String(yearMax));

    const res = await fetch(`${API_BASE}/search?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // --- Analytics ---
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // --- Admin Stats ---
  async getAdminStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // --- Export Download ---
  async exportDocument(title: string, content: string, format: 'pdf' | 'docx' | 'md' | 'txt', metadata?: Record<string, any>) {
    const res = await fetch(`${API_BASE}/export/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, format, metadata })
    });
    if (!res.ok) throw new Error("Export generation failed.");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
};
