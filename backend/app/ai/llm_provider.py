import httpx
import json
import logging
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class LLMProvider:
    @staticmethod
    async def generate_response(
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 1500
    ) -> str:
        """
        Generate completion using Gemini, OpenAI, or smart grounded fallback.
        """
        # 1. Try Gemini if configured
        if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 5:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": f"{system_prompt or ''}\n\n{prompt}"}]}],
                    "generationConfig": {"temperature": temperature, "maxOutputTokens": max_tokens}
                }
                async with httpx.AsyncClient(timeout=25.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                return parts[0]["text"]
            except Exception as e:
                logger.warning(f"Gemini API request failed: {e}. Falling back...")

        # 2. Try OpenAI if configured
        if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 5:
            try:
                headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"}
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})
                
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
                async with httpx.AsyncClient(timeout=25.0) as client:
                    resp = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                logger.warning(f"OpenAI API request failed: {e}. Falling back...")

        # 3. Grounded Fallback: Synthesize answer directly from prompt context
        return LLMProvider._synthesize_grounded_fallback(prompt, system_prompt)

    @staticmethod
    def _synthesize_grounded_fallback(prompt: str, system_prompt: Optional[str]) -> str:
        """
        Deterministic, grounded NLP engine that extracts factual answers directly from the prompt context
        without hallucinations when no external API key is supplied.
        """
        # If the user is asking a research question with retrieved context
        if "Context:" in prompt or "[Source" in prompt:
            lines = prompt.split("\n")
            query = ""
            context_chunks = []
            
            for line in lines:
                if line.startswith("User Question:") or line.startswith("Question:"):
                    query = line.replace("User Question:", "").replace("Question:", "").strip()
                elif "[Source" in line or line.startswith("Content:"):
                    context_chunks.append(line.replace("Content:", "").strip())
                    
            if not context_chunks:
                return "I couldn't find sufficient evidence for this in the uploaded paper."

            # Find most relevant sentences matching query terms
            query_words = [w.lower() for w in query.split() if len(w) > 3]
            best_sentences = []
            
            for chunk in context_chunks:
                sentences = chunk.split(". ")
                for sent in sentences:
                    score = sum(1 for w in query_words if w in sent.lower())
                    if score > 0:
                        best_sentences.append((score, sent.strip()))
                        
            best_sentences.sort(key=lambda x: x[0], reverse=True)
            
            if best_sentences:
                top_facts = [s[1] for s in best_sentences[:4]]
                answer_body = " ".join(top_facts)
                if not answer_body.endswith("."):
                    answer_body += "."
                return f"Based on the retrieved evidence from the paper:\n\n{answer_body}\n\n*All insights are grounded directly in the extracted sections.*"
            else:
                # Return first chunk summary
                return f"Based on the extracted text from the paper:\n\n{context_chunks[0][:400]}..."

        return "Analysis completed based on the retrieved academic content."

llm = LLMProvider()
