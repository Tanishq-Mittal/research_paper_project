import json
import uuid
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import (
    User, Paper, PaperAuthor, PaperChunk, Collection, CollectionPaper,
    Note, Highlight, LiteratureReview, PaperComparison, ResearchGapAnalysis
)
from app.security.tokens import get_password_hash
from app.rag.embeddings import embedding_engine
from app.rag.vector_store import vector_store

DEMO_USER_ID = "usr-demo-scholar-001"

PAPERS_SEED = [
    {
        "id": "paper-001-attention",
        "title": "Attention Is All You Need",
        "original_filename": "attention_is_all_you_need.pdf",
        "page_count": 11,
        "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.",
        "publication_year": 2017,
        "journal_venue": "NeurIPS",
        "doi": "10.48550/arXiv.1706.03762",
        "url": "https://arxiv.org/abs/1706.03762",
        "citation_count": 124500,
        "reading_status": "Completed",
        "reading_progress": 100,
        "is_favorite": True,
        "is_demo": True,
        "keywords": ["Transformer", "Self-Attention", "Multi-Head Attention", "Machine Translation", "Deep Learning"],
        "authors": [
            {"name": "Ashish Vaswani", "affiliation": "Google Brain"},
            {"name": "Noam Shazeer", "affiliation": "Google Brain"},
            {"name": "Niki Parmar", "affiliation": "Google Research"},
            {"name": "Jakob Uszkoreit", "affiliation": "Google Research"},
            {"name": "Llion Jones", "affiliation": "Google Research"},
            {"name": "Aidan N. Gomez", "affiliation": "University of Toronto"},
            {"name": "Łukasz Kaiser", "affiliation": "Google Brain"},
            {"name": "Illia Polosukhin", "affiliation": ""},
        ],
        "scorecard": {
            "citation_count": 124500,
            "publication_year": 2017,
            "dataset_reported": True,
            "dataset_name": "WMT 2014 English-to-German & English-to-French",
            "experiments_count": 8,
            "metrics_reported": ["BLEU", "Training Cost (FLOPs)", "Inference Latency"],
            "is_open_access": True,
            "references_count": 42
        },
        "digest": {
            "executive_summary": "The paper introduces the Transformer, an architecture relying entirely on self-attention mechanisms to compute representations of its input and output without using sequence-aligned RNNs or convolution.",
            "research_problem": "Recurrent neural networks process tokens sequentially, inherently preventing parallelization within training examples and struggling with long-range dependencies.",
            "motivation": "Crucial for accelerating large-scale training and capturing global context across long text sequences without information loss.",
            "methodology_steps": [
                "Construct stacked Encoder and Decoder with multi-head self-attention and position-wise feed-forward networks.",
                "Apply Scaled Dot-Product Attention: Attention(Q,K,V) = softmax(Q K^T / sqrt(d_k)) V.",
                "Incorporate Sinusoidal Positional Encodings to inject token order information.",
                "Train using Adam optimizer with custom learning rate warmup schedule."
            ],
            "dataset_details": {
                "name": "WMT 2014 English-to-German & English-to-French",
                "samples_count": "4.5 million sentence pairs (EN-DE), 36 million (EN-FR)",
                "train_test_split": "Standard WMT newstest2014",
                "source": "WMT Academic Translation Benchmark"
            },
            "algorithms_and_models": ["Transformer", "Scaled Dot-Product Attention", "Multi-Head Attention", "Adam Optimizer", "Byte-Pair Encoding"],
            "results_and_metrics": {
                "BLEU Score (EN-DE)": "28.4 BLEU (improving over existing state-of-the-art by >2 BLEU)",
                "BLEU Score (EN-FR)": "41.8 BLEU (new single-model state-of-the-art)",
                "Training Efficiency": "Trained in only 3.5 days on 8 P100 GPUs (fraction of prior model compute)"
            },
            "limitations": [
                "O(N^2) quadratic memory and compute complexity with sequence length N.",
                "Requires massive data volumes to generalize effectively without inductive bias.",
                "Positional encodings have limited extrapolation to sequences longer than training window."
            ],
            "future_work": [
                "Extend attention to other modalities such as images, audio, and video.",
                "Investigate local or restricted attention mechanisms for long documents.",
                "Make generation non-autoregressive for faster inference."
            ]
        },
        "sections": {
            "Abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
            "Introduction": "Recurrent models typically factor computation along the symbol positions of the input and output sequences. This inherently sequential nature precludes parallelization...",
            "Methodology": "The Transformer follows an encoder-decoder architecture. The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers: a multi-head self-attention mechanism and a position-wise fully connected feed-forward network. Scaled Dot-Product Attention computes Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V...",
            "Datasets & Setup": "On the WMT 2014 English-to-German dataset consisting of 4.5 million sentence pairs, we trained on 8 NVIDIA P100 GPUs for 3.5 days...",
            "Experiments & Results": "On the WMT 2014 English-to-German task, the big transformer model achieves 28.4 BLEU, outperforming existing best models including ensembles by over 2.0 BLEU...",
            "Discussion & Limitations": "While parallelization is superior, attention computation memory scales quadratically with sequence length...",
            "Conclusion & Future Work": "We presented the Transformer, the first sequence transduction model based entirely on attention. We plan to extend attention-based models to other tasks and investigate efficient local attention."
        }
    },
    {
        "id": "paper-002-lora",
        "title": "LoRA: Low-Rank Adaptation of Large Language Models",
        "original_filename": "lora_low_rank_adaptation.pdf",
        "page_count": 14,
        "abstract": "An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to specific tasks. As models grow, full fine-tuning becomes prohibitive. We propose Low-Rank Adaptation (LoRA), which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters.",
        "publication_year": 2021,
        "journal_venue": "ICLR",
        "doi": "10.48550/arXiv.2106.09685",
        "url": "https://arxiv.org/abs/2106.09685",
        "citation_count": 18900,
        "reading_status": "Reading",
        "reading_progress": 75,
        "is_favorite": True,
        "is_demo": True,
        "keywords": ["Parameter-Efficient Fine-Tuning", "LoRA", "LLMs", "Matrix Factorization", "VRAM Optimization"],
        "authors": [
            {"name": "Edward J. Hu", "affiliation": "Microsoft"},
            {"name": "Yelong Shen", "affiliation": "Microsoft"},
            {"name": "Phillip Wallis", "affiliation": "Microsoft"},
            {"name": "Zeyuan Allen-Zhu", "affiliation": "Microsoft"},
            {"name": "Yuanzhi Li", "affiliation": "Carnegie Mellon University"},
            {"name": "Shean Wang", "affiliation": "Microsoft"},
            {"name": "Lu Wang", "affiliation": "University of Michigan"},
            {"name": "Weizhu Chen", "affiliation": "Microsoft"}
        ],
        "scorecard": {
            "citation_count": 18900,
            "publication_year": 2021,
            "dataset_reported": True,
            "dataset_name": "GLUE, MultiNLI, SQuAD, E2E NLG Challenge",
            "experiments_count": 12,
            "metrics_reported": ["Accuracy", "F1 Score", "BLEU", "VRAM (GB)", "Checkpoint Size"],
            "is_open_access": True,
            "references_count": 56
        },
        "digest": {
            "executive_summary": "LoRA freezes pre-trained model weights and injects trainable rank decomposition matrices into Transformer attention layers, reducing trainable parameters by 10,000x and GPU memory by 3x with zero inference latency.",
            "research_problem": "Fine-tuning all parameters of massive language models (e.g. GPT-3 175B) is computationally prohibitive and creates gigantic per-task checkpoints.",
            "motivation": "Enables multi-task deployment and lightweight customized adaptation on commodity hardware without latency penalties.",
            "methodology_steps": [
                "Hypothesize that weight updates ΔW have a low 'intrinsic rank'.",
                "Decompose ΔW = B × A where B ∈ R^{d×r} and A ∈ R^{r×k} with rank r << min(d, k).",
                "Initialize A with Gaussian distribution and B with zeros so ΔW = 0 initially.",
                "Fold B × A directly into W during deployment to eliminate inference overhead."
            ],
            "dataset_details": {
                "name": "GLUE Benchmark, WikiSQL, SAMSum, E2E NLG",
                "samples_count": "Over 500,000 across multiple tasks",
                "train_test_split": "Standard GLUE dev/test splits",
                "source": "Academic NLP Benchmarks"
            },
            "algorithms_and_models": ["LoRA", "GPT-3", "RoBERTa", "DeBERTa", "AdamW Optimizer"],
            "results_and_metrics": {
                "GLUE Score": "Matches or outperforms full fine-tuning on RoBERTa and DeBERTa",
                "Parameter Reduction": "Trainable parameters reduced by 10,000x (e.g. from 175B to 35M in GPT-3)",
                "VRAM Memory Savings": "GPU VRAM usage reduced by up to 75% (from 1.2TB to 350GB on GPT-3 175B)"
            },
            "limitations": [
                "Cannot easily batch different LoRA adapters together in a single high-throughput inference pass without custom kernels.",
                "Optimal rank r selection is empirical and varies across downstream tasks."
            ],
            "future_work": [
                "Combine LoRA with other parameter-efficient approaches like prefix tuning.",
                "Investigate dynamic rank allocation across different attention and MLP layers."
            ]
        },
        "sections": {
            "Abstract": "An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to specific tasks...",
            "Introduction": "Many applications in NLP rely on adapting one large, pre-trained language model to multiple downstream tasks. Full fine-tuning becomes intractable as model sizes escalate...",
            "Methodology": "We propose Low-Rank Adaptation (LoRA). For a pre-trained weight matrix W_0, we constrain its update by representing ΔW = B A where B is d-by-r and A is r-by-k with rank r << min(d, k)...",
            "Datasets & Setup": "We evaluate LoRA on RoBERTa, DeBERTa, and GPT-3 175B across GLUE benchmarks and NLG generation suites...",
            "Experiments & Results": "LoRA matches or exceeds full fine-tuning accuracy while requiring less than 0.5% trainable parameters...",
            "Discussion & Limitations": "A limitation is that serving multiple concurrent requests with different adapters requires specialized batching kernels...",
            "Conclusion & Future Work": "LoRA makes large model adaptation accessible and lightweight without inference overhead."
        }
    },
    {
        "id": "paper-003-resnet",
        "title": "Deep Residual Learning for Image Recognition",
        "original_filename": "resnet_deep_residual_learning.pdf",
        "page_count": 12,
        "abstract": "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions.",
        "publication_year": 2016,
        "journal_venue": "CVPR",
        "doi": "10.1109/CVPR.2016.90",
        "url": "https://arxiv.org/abs/1512.03385",
        "citation_count": 215000,
        "reading_status": "Completed",
        "reading_progress": 100,
        "is_favorite": False,
        "is_demo": True,
        "keywords": ["Residual Connections", "Deep CNNs", "ImageNet", "Computer Vision", "Vanishing Gradient"],
        "authors": [
            {"name": "Kaiming He", "affiliation": "Microsoft Research"},
            {"name": "Xiangyu Zhang", "affiliation": "Microsoft Research"},
            {"name": "Shaoqing Ren", "affiliation": "Microsoft Research"},
            {"name": "Jian Sun", "affiliation": "Microsoft Research"}
        ],
        "scorecard": {
            "citation_count": 215000,
            "publication_year": 2016,
            "dataset_reported": True,
            "dataset_name": "ImageNet 2012, CIFAR-10, COCO",
            "experiments_count": 15,
            "metrics_reported": ["Top-1 Error", "Top-5 Error", "mAP"],
            "is_open_access": True,
            "references_count": 48
        },
        "digest": {
            "executive_summary": "Introduces residual skip connections F(x) + x that allow training networks with over 150 layers, winning the ImageNet 2015 competition and solving the degradation problem.",
            "research_problem": "As neural networks get deeper, accuracy saturates and then degrades rapidly due to optimization difficulties rather than overfitting.",
            "motivation": "Deeper representations are essential for high-level visual recognition tasks.",
            "methodology_steps": [
                "Formulate residual mapping H(x) = F(x) + x using identity shortcut connections.",
                "Stack bottleneck residual blocks (1x1, 3x3, 1x1 convolutions).",
                "Apply Batch Normalization right after each convolution and before activation."
            ],
            "dataset_details": {
                "name": "ImageNet 2012 Classification Dataset",
                "samples_count": "1.28 million training images, 50,000 validation images across 1,000 classes",
                "train_test_split": "Standard ILSVRC split",
                "source": "ImageNet Challenge"
            },
            "algorithms_and_models": ["ResNet-50", "ResNet-101", "ResNet-152", "SGD with Momentum", "Batch Normalization"],
            "results_and_metrics": {
                "ImageNet Top-5 Error": "3.57% top-5 error rate (1st place in ILSVRC 2015)",
                "Depth Scaling": "Successfully trained 152-layer network (8x deeper than VGG)",
                "COCO Object Detection": "28% relative mAP gain over prior state-of-the-art"
            },
            "limitations": [
                "Diminishing returns in accuracy when scaling beyond 1000 layers without additional regularization.",
                "Shortcut connections do not increase parameter capacity directly."
            ],
            "future_work": [
                "Explore wider networks (Wide ResNets) and stochastic depth dropping.",
                "Apply residual learning to non-visual sequence and graph domains."
            ]
        },
        "sections": {
            "Abstract": "Deeper neural networks are more difficult to train. We present a residual learning framework...",
            "Introduction": "Deep convolutional networks have led to breakthroughs for image classification. Driven by the significance of depth, a question arises: Is learning better networks as easy as stacking more layers? A degradation problem occurs...",
            "Methodology": "Let us consider H(x) as an underlying mapping to be fit. We hypothesize that it is easier to optimize the residual mapping F(x) := H(x) - x. The original mapping becomes F(x) + x via identity shortcut connections...",
            "Datasets & Setup": "We evaluate on the ImageNet 2012 classification dataset consisting of 1.28 million training images across 1000 categories...",
            "Experiments & Results": "Our 152-layer ResNet achieves 3.57% top-5 error on the ImageNet test set, winning 1st place in ILSVRC 2015...",
            "Discussion & Limitations": "Extremely deep models (1202 layers) exhibit slight overfitting on CIFAR-10 without stronger data augmentation...",
            "Conclusion & Future Work": "Residual connections make ultra-deep neural networks easy to optimize."
        }
    }
]

async def seed_initial_data(db: AsyncSession):
    """
    Check and seed initial demo user, foundational papers, chunks, embeddings, collections, and reviews.
    """
    # Check if demo user exists
    stmt = select(User).where(User.email == "demo@scholarpulse.edu")
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        user = User(
            id=DEMO_USER_ID,
            email="demo@scholarpulse.edu",
            hashed_password=get_password_hash("Demo1234!"),
            full_name="Alex Rivera",
            role="Student Researcher",
            research_interests="Machine Learning, Large Language Models, Parameter-Efficient Adaptation",
            preferred_citation_style="APA",
            theme="dark",
            ai_model_pref="Gemini 1.5 Pro / GPT-4o"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Seed Collections
    stmt = select(Collection).where(Collection.user_id == user.id)
    c_res = await db.execute(stmt)
    existing_collections = c_res.scalars().all()

    col_map = {}
    if not existing_collections:
        c1 = Collection(id="col-001", user_id=user.id, name="Large Language Models", description="Core architectures, self-attention, and foundation models", color="#6366f1", icon="sparkles")
        c2 = Collection(id="col-002", user_id=user.id, name="Parameter-Efficient AI", description="LoRA, adapters, and memory optimization research", color="#10b981", icon="zap")
        c3 = Collection(id="col-003", user_id=user.id, name="Vision & Deep Architectures", description="Residual networks and computer vision backbones", color="#f59e0b", icon="layers")
        db.add_all([c1, c2, c3])
        await db.commit()
        col_map["llm"] = c1.id
        col_map["peft"] = c2.id
        col_map["vision"] = c3.id

    # Seed Papers
    for p_data in PAPERS_SEED:
        stmt = select(Paper).where(Paper.id == p_data["id"])
        p_res = await db.execute(stmt)
        existing_p = p_res.scalar_one_or_none()

        if not existing_p:
            paper = Paper(
                id=p_data["id"],
                user_id=user.id,
                title=p_data["title"],
                original_filename=p_data["original_filename"],
                page_count=p_data["page_count"],
                abstract=p_data["abstract"],
                publication_year=p_data["publication_year"],
                journal_venue=p_data["journal_venue"],
                doi=p_data["doi"],
                url=p_data["url"],
                citation_count=p_data["citation_count"],
                keywords_json=json.dumps(p_data["keywords"]),
                scorecard_json=json.dumps(p_data["scorecard"]),
                digest_json=json.dumps(p_data["digest"]),
                reading_status=p_data["reading_status"],
                reading_progress=p_data["reading_progress"],
                is_favorite=p_data["is_favorite"],
                is_demo=p_data["is_demo"]
            )
            db.add(paper)
            await db.flush()

            # Add Authors
            for idx, a in enumerate(p_data["authors"]):
                auth = PaperAuthor(
                    paper_id=paper.id,
                    name=a["name"],
                    affiliation=a["affiliation"],
                    order_idx=idx
                )
                db.add(auth)

            # Add Chunks and index into vector store
            chunks_list = []
            chunk_texts = []
            chunk_idx = 0
            
            for sec_name, sec_content in p_data["sections"].items():
                words = sec_content.split()
                step = 120
                for i in range(0, len(words), step):
                    chunk_str = " ".join(words[i:i+150])
                    page_est = min(p_data["page_count"], max(1, int(1 + (i / max(1, len(words))) * p_data["page_count"])))
                    chunk_obj = PaperChunk(
                        id=str(uuid.uuid4()),
                        paper_id=paper.id,
                        chunk_index=chunk_idx,
                        section_name=sec_name,
                        page_number=page_est,
                        content=chunk_str,
                        token_count=len(chunk_str.split())
                    )
                    db.add(chunk_obj)
                    chunks_list.append({
                        "id": chunk_obj.id,
                        "paper_id": paper.id,
                        "chunk_index": chunk_idx,
                        "section_name": sec_name,
                        "page_number": page_est,
                        "content": chunk_str
                    })
                    chunk_texts.append(chunk_str)
                    chunk_idx += 1

            # Embed and insert into vector store
            embeddings = embedding_engine.embed_texts(chunk_texts)
            vector_store.add_chunks(paper.id, chunks_list, embeddings)

            # Link to collection
            if "attention" in paper.id and "col-001" in [c.id for c in existing_collections] + ["col-001"]:
                db.add(CollectionPaper(collection_id="col-001", paper_id=paper.id))
            elif "lora" in paper.id and "col-002" in [c.id for c in existing_collections] + ["col-002"]:
                db.add(CollectionPaper(collection_id="col-002", paper_id=paper.id))
            elif "resnet" in paper.id and "col-003" in [c.id for c in existing_collections] + ["col-003"]:
                db.add(CollectionPaper(collection_id="col-003", paper_id=paper.id))

    # Seed Sample Note & Highlight
    stmt = select(Note).where(Note.user_id == user.id)
    n_res = await db.execute(stmt)
    if not n_res.scalars().all():
        n1 = Note(
            id=str(uuid.uuid4()),
            user_id=user.id,
            paper_id="paper-001-attention",
            title="Multi-Head Attention Dimension Invariant",
            content="In Multi-Head Attention, total dimension d_model is split across h heads (d_k = d_model / h). For standard base model, d_model=512 and h=8, so each head has dimension 64.",
            tag="Important Method",
            page_number=4,
            selected_text="Multi-head attention allows the model to jointly attend to information from different representation subspaces."
        )
        h1 = Highlight(
            id=str(uuid.uuid4()),
            user_id=user.id,
            paper_id="paper-001-attention",
            page_number=3,
            text="Scaled Dot-Product Attention computes Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V.",
            color="#fef08a",
            note_text="Key mathematical formula for Transformer attention."
        )
        db.add_all([n1, h1])

    await db.commit()
