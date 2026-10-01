import numpy as np
from typing import List, Union
import logging
from sklearn.feature_extraction.text import TfidfVectorizer

logger = logging.getLogger(__name__)

class EmbeddingEngine:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.st_model = None
        self._init_model()

    def _init_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            self.st_model = SentenceTransformer(self.model_name)
            logger.info(f"Loaded SentenceTransformer: {self.model_name}")
        except Exception as e:
            logger.info(f"SentenceTransformer not loaded directly ({e}), using TF-IDF subword vector engine.")
            self.st_model = None

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, 384))
            
        if self.st_model:
            try:
                embeddings = self.st_model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
                return embeddings
            except Exception as e:
                logger.warning(f"SentenceTransformer encode failed: {e}. Falling back to TF-IDF vectorizer.")
                
        # Scikit-learn TF-IDF with character n-grams + word n-grams
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=384,
            sublinear_tf=True
        )
        try:
            raw_matrix = vectorizer.fit_transform(texts).toarray()
            # Pad columns to exactly 384 if fewer features were found
            num_samples, num_cols = raw_matrix.shape
            if num_cols < 384:
                padded = np.zeros((num_samples, 384))
                padded[:, :num_cols] = raw_matrix
                raw_matrix = padded
            elif num_cols > 384:
                raw_matrix = raw_matrix[:, :384]

            norms = np.linalg.norm(raw_matrix, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            return raw_matrix / norms
        except Exception:
            return np.ones((len(texts), 384)) / np.sqrt(384)

    def embed_query(self, query: str, context_texts: List[str] = None) -> np.ndarray:
        if self.st_model:
            try:
                return self.st_model.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0]
            except Exception:
                pass
                
        if context_texts:
            all_texts = [query] + context_texts
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=384, sublinear_tf=True)
            try:
                raw_matrix = vectorizer.fit_transform(all_texts).toarray()
                num_samples, num_cols = raw_matrix.shape
                if num_cols < 384:
                    padded = np.zeros((num_samples, 384))
                    padded[:, :num_cols] = raw_matrix
                    raw_matrix = padded
                elif num_cols > 384:
                    raw_matrix = raw_matrix[:, :384]

                norms = np.linalg.norm(raw_matrix, axis=1, keepdims=True)
                norms[norms == 0] = 1.0
                normalized = raw_matrix / norms
                return normalized[0]
            except Exception:
                pass
        return np.ones(384) / np.sqrt(384)

embedding_engine = EmbeddingEngine()
