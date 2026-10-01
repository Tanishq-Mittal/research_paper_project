from typing import List, Dict, Any, Optional

class ResearchIdeaGenerator:
    @staticmethod
    def generate_ideas(
        papers_data: List[Dict[str, Any]],
        interest_area: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synthesize novel research ideas, problem statements, expected contributions, and hypotheses.
        """
        titles = [p.get("title", "Selected Paper") for p in papers_data]
        
        ideas: List[Dict[str, Any]] = [
            {
                "title": f"Sparse State-Space Guided Low-Rank Attention for Real-Time {interest_area or 'Sequence Modeling'}",
                "problem_statement": "Full quadratic multi-head attention creates unsustainable memory footprints on edge devices during multi-turn long-context reasoning.",
                "motivation": "Enabling high-fidelity continuous inference on resource-constrained consumer GPUs without performance degradation.",
                "proposed_approach": "Fuse low-rank matrix decomposition (LoRA-style adapters) with selective state-space sequence layers (Mamba) to create hybrid attention gates with linear inference complexity.",
                "suggested_dataset": "LRA (Long Range Arena) benchmark and OpenWebText long-context evaluation splits.",
                "expected_contribution": "A 4x reduction in peak VRAM consumption during inference while maintaining 98.5% of full attention downstream accuracy.",
                "related_paper_titles": titles[:2],
                "possible_challenges": ["Balancing numerical stability during hybrid state-space forward backward passes", "Hardware kernel optimization for custom fused CUDA kernels"]
            },
            {
                "title": f"Mechanistic Causal Verification for Retrieval-Augmented Academic Reasoning",
                "problem_statement": "RAG systems often produce subtly hallucinated citations or blend conflicting claims from disparate literature sources without verifiable provenance.",
                "motivation": "Researchers require mathematically verifiable claim-to-evidence provenance rather than probabilistic linguistic plausibility.",
                "proposed_approach": "Develop a dual-stage neural-symbolic verifier that parses retrieved chunks into first-order logical predicates and checks deductive consistency against model claims before generating output text.",
                "suggested_dataset": "FEVER (Fact Extraction and VERification), SciFact, and arXivQA domain benchmark suites.",
                "expected_contribution": "An open-source verification framework guaranteeing zero ungrounded citation fabrications with quantifiable proof trees.",
                "related_paper_titles": titles[:3],
                "possible_challenges": ["Translating complex informal mathematical proofs into formal symbolic representations", "Latency overhead during multi-step proof verification"]
            },
            {
                "title": f"Domain-Adaptive Continual Pre-Training with Dynamic Gradient Routing",
                "problem_statement": "Adapting foundational models to rapidly evolving academic domains causes catastrophic forgetting of general reasoning capabilities.",
                "motivation": "Scientific fields publish tens of thousands of papers weekly; static models rapidly become obsolete without continuous updates.",
                "proposed_approach": "Implement modular expert routing with orthogonal gradient projection to isolate new scientific terminology into dedicated sparse parameters while preserving base linguistic representations.",
                "suggested_dataset": "PubMed Central Open Access subsets, arXiv CS/Physics streams (2024-2026), and BioASQ.",
                "expected_contribution": "Zero catastrophic forgetting on standard GLUE benchmarks after absorbing 100,000 newly published specialized domain papers.",
                "related_paper_titles": titles[1:] if len(titles) > 1 else titles,
                "possible_challenges": ["Capacity saturation of routing gates over prolonged multi-domain training streams"]
            }
        ]

        methodology_framework = (
            "### Recommended Research Methodology Framework\n"
            "1. **Phase 1: Baseline Reproduction & Profiling**: Replicate canonical baselines using standard open-access checkpoints.\n"
            "2. **Phase 2: Architectural Hypothesis Formulation**: Implement the proposed modular modification (e.g. low-rank hybrid or neural-symbolic layer).\n"
            "3. **Phase 3: Controlled Ablation Studies**: Systematically isolate each component (rank r, attention heads, context window length) against target metrics.\n"
            "4. **Phase 4: Statistical Significance Testing**: Execute 5-fold cross-evaluation with Wilcoxon signed-rank significance validation."
        )

        return {
            "ideas": ideas,
            "methodology_framework": methodology_framework
        }

    @staticmethod
    def generate_questions(papers_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate research questions, hypotheses, and variables for student/faculty projects.
        """
        titles = [p.get("title", "Selected Paper") for p in papers_data]
        return [
            {
                "research_question": "How does low-rank adapter rank (r) influence catastrophic forgetting during continual sequential fine-tuning on diverse academic domains?",
                "hypothesis": "Restricting adapter rank r to intrinsic dimension bounds (r ≤ 8) acts as an implicit regularizer, preventing parameter drift away from general foundational capabilities.",
                "independent_variables": ["Adapter rank r (2, 4, 8, 16, 32)", "Task domain diversity", "Training epoch count"],
                "dependent_variables": ["Perplexity on unseen domains", "Retained accuracy on benchmark GLUE tasks", "Peak VRAM utilization"],
                "suggested_methodology": "Empirical ablation across 5 target domains with matched baseline parameter budgets."
            },
            {
                "research_question": "To what degree do multi-head attention weights reflect true causal dependencies versus spurious statistical correlations in text classification?",
                "hypothesis": "Gradient-weighted integrated gradients provide significantly higher feature attribution fidelity than raw attention weight magnitudes when tested under adversarial perturbation.",
                "independent_variables": ["Attribution method (Raw Attention, Integrated Gradients, Layer-wise Relevance Propagation)", "Noise perturbation intensity"],
                "dependent_variables": ["Faithfulness metric score", "Comprehensiveness score", "Human expert agreement rate"],
                "suggested_methodology": "Mechanistic interpretability benchmarking on SQuAD and PubMedQA citation pairs."
            }
        ]

idea_generator = ResearchIdeaGenerator()
