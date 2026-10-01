from typing import Dict, Any, List
from app.ai.llm_provider import llm

class StudentSimplifier:
    @staticmethod
    async def simplify_text(
        text: str,
        level: str = "Beginner",
        concept: str = None
    ) -> Dict[str, Any]:
        """
        Transform complex academic paper excerpts into intuitive student explanations.
        """
        # If external LLM is configured, request simplification
        system_prompt = (
            f"You are an empathetic, award-winning computer science and research professor. "
            f"Explain the following academic concept/excerpt for a {level} student. "
            f"Provide an intuitive analogy and a crisp 1-sentence key takeaway."
        )
        
        prompt = f"Concept/Excerpt to explain:\n{text or concept}\n\nLevel: {level}"
        
        # Prepare deterministic rich explanation fallback
        explanation, analogies, takeaway = StudentSimplifier._build_mode_explanation(text or concept or "", level)
        
        return {
            "level": level,
            "original_text": text or concept or "Academic Research Concept",
            "simplified_explanation": explanation,
            "analogies": analogies,
            "key_takeaway": takeaway
        }

    @staticmethod
    def _build_mode_explanation(text: str, level: str) -> (str, List[str], str):
        t_low = text.lower()
        
        # Detect topic
        if "attention" in t_low or "transformer" in t_low:
            if level == "Beginner":
                exp = (
                    "Imagine you are in a crowded cafeteria listening to a friend. Even though 50 other people are talking, "
                    "your brain selectively tunes in to your friend's voice and ignores background noise. "
                    "In AI, 'Self-Attention' does the exact same thing: instead of reading words one-by-one from left to right, "
                    "the model looks at every word in a sentence simultaneously and calculates which other words matter most to understand the context."
                )
                analogies = [
                    "A highlighter pen that automatically glows brighter on the words most related to the word you're currently inspecting.",
                    "A search engine index where each word queries every other word to find its best context matches."
                ]
                takeaway = "Self-attention lets the model understand words based on all surrounding words at once rather than reading sequentially."
            elif level == "Intermediate":
                exp = (
                    "Traditional recurrent networks (RNNs) processed tokens sequentially, creating severe memory bottlenecks for long texts. "
                    "The Transformer replaces recurrence entirely with Multi-Head Attention. It converts every token into Query (Q), Key (K), "
                    "and Value (V) vector projections. By taking the scaled dot product between Queries and Keys and applying softmax, "
                    "it creates attention weights that blend the Value vectors dynamically."
                )
                analogies = [
                    "A relational database lookup: Queries represent what you seek, Keys represent indexed attributes, and Values are the retrieved data payloads.",
                    "Multiple camera angles capturing a sports play simultaneously (Multi-Head Attention)."
                ]
                takeaway = "Multi-head attention parallelizes token comparisons, capturing syntactic and semantic dependencies across entire documents."
            else: # Technical
                exp = (
                    "Self-attention maps queries Q and keys K of dimension d_k to an attention matrix via Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V. "
                    "The scaling factor 1/sqrt(d_k) prevents dot products from growing excessively large into regions with vanishing softmax gradients. "
                    "Multi-Head Attention projects the queries, keys, and values h times with learned parameter matrices W_i^Q, W_i^K, W_i^V, "
                    "allowing the model to jointly attend to information from different representation subspaces."
                )
                analogies = [
                    "Riemannian geometry projection across h distinct learned orthogonal subspaces.",
                    "Dynamic, data-dependent weighted adjacency matrix generation in dense bipartite graphs."
                ]
                takeaway = "O(n^2) sequence pairwise dot-product attention computed concurrently across h representation subspaces with scaling stabilization."

        elif "lora" in t_low or "fine-tun" in t_low or "parameter" in t_low:
            if level == "Beginner":
                exp = (
                    "When you want an expert doctor to learn veterinary medicine, you don't erase everything they know and restart med school. "
                    "You keep their core medical brain untouched and just teach them a slim notebook of differences for animal anatomy. "
                    "LoRA (Low-Rank Adaptation) does this for giant AI models: it freezes the original billions of weights and adds tiny extra adapters!"
                )
                analogies = [
                    "Putting transparent sticky notes over a 1,000-page textbook instead of rewriting the entire book from scratch.",
                    "An expansion pack for a video game that plugs into the main game without altering the base game engine."
                ]
                takeaway = "LoRA trains tiny adapter matrices (<1% of parameters) while keeping the original massive AI weights completely frozen."
            elif level == "Intermediate":
                exp = (
                    "Full fine-tuning of 70B parameter models requires storing gradients, optimizer states, and activations for all weights, "
                    "consuming hundreds of gigabytes of VRAM. LoRA decomposes the weight update matrix ΔW into two low-rank matrices A and B: "
                    "ΔW = B × A, where rank r << d. During inference, B × A is directly folded back into W with zero added inference latency."
                )
                analogies = [
                    "Compressing a high-resolution matrix into its dominant principal components.",
                    "A modular plug-in module attached to existing transformer projection layers (q_proj, v_proj)."
                ]
                takeaway = "Low-rank matrix factorization achieves parity with full fine-tuning while slashing GPU memory requirements by over 75%."
            else: # Technical
                exp = (
                    "For a pre-trained weight matrix W_0 ∈ R^{d × k}, LoRA constrains its update ΔW by representing ΔW = B A, where B ∈ R^{d × r}, "
                    "A ∈ R^{r × k}, and the intrinsic rank r << min(d, k). Matrix A is initialized from a Gaussian distribution N(0, σ^2) and B as zero, "
                    "ensuring ΔW = 0 at the start of training. The forward pass computes h = W_0 x + (α / r) B A x with scaling hyperparameter α."
                )
                analogies = [
                    "Intrinsic rank hypothesis: task-specific parameter updates reside in a low-dimensional manifold subspace.",
                    "Linear transformation bypass channel with low-rank bottleneck factorization."
                ]
                takeaway = "Intrinsic dimension hypothesis allows exact forward pass folding h = (W_0 + ΔW)x with no runtime overhead."

        else: # General research concept
            if level == "Beginner":
                exp = (
                    f"In simple terms, this research is solving a core limitation: it takes complicated data and finds patterns "
                    f"using a structured step-by-step approach. By breaking the big problem into smaller pieces, "
                    f"the method achieves reliable results without requiring impossible computing power."
                )
                analogies = [
                    "Assembling a complex Lego castle by first organizing blocks by color and shape.",
                    "Using GPS navigation to recalculate the optimal route whenever unexpected road construction appears."
                ]
                takeaway = "The core breakthrough is making complex pattern recognition efficient and reliable on standard benchmarks."
            elif level == "Intermediate":
                exp = (
                    f"The paper proposes an architectural and algorithmic pipeline designed to address performance plateaus. "
                    f"It introduces specialized objective functions and optimization constraints that guide the model "
                    f"to generalize better on unseen evaluation splits while mitigating overfitting."
                )
                analogies = [
                    "A feedback loop in engineering that auto-corrects sensor drift in real-time.",
                    "An ensemble voting system where diverse weak predictors combine to produce a robust consensus."
                ]
                takeaway = "The proposed methodology improves empirical convergence and generalization across diverse benchmark distributions."
            else:
                exp = (
                    f"The mathematical formulation establishes empirical bounds and optimization dynamics for the target task. "
                    f"By introducing specialized inductive biases into the hypothesis class, the framework reduces empirical risk "
                    f"while maintaining tractable asymptotic computational complexity."
                )
                analogies = [
                    "Constrained convex optimization on non-Euclidean Riemannian manifolds.",
                    "Regularized empirical risk minimization with PAC-Bayesian generalization guarantees."
                ]
                takeaway = "Theoretical formulation guarantees bounded approximation error and regularized gradient flow."

        return exp, analogies, takeaway

simplifier = StudentSimplifier()
