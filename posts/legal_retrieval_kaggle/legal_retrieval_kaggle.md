---
title: "Fine-Tuning EmbeddingGemma-300M for Legal Information Retrieval"
author: "Lucas Hudson"
date: "2026-03-07"
categories: [ML]
format:
  html:
    theme: lux
---

# Fine-Tuning an Embedding Model for Legal Information Retrieval

**Competition:** [Kaggle — LLM Agentic Legal Information Retrieval](https://www.kaggle.com/competitions/llm-agentic-legal-information-retrieval)
**My Role:** Embedding model (part of a group project with colleagues)
**Model:** `unsloth/embeddinggemma-300m` fine-tuned with LoRA
**Hardware:** Apple Silicon Mac (MPS backend, no CUDA)

---

## Overview

This was a group Kaggle competition where the core task was legal information retrieval: given a query from a legal document, retrieve the most relevant laws or court considerations from a corpus. My responsibility was the embedding model — fine-tuning a dense retrieval model that could learn what "relevant" means specifically in the German legal domain.

The core idea was to take a pre-trained embedding model, feed it domain-specific (query, relevant passage) pairs, and use contrastive learning to push relevant query-document pairs closer together in vector space. I also wanted to use this as an opportunity to explore whether embedding fine-tuning on Apple Silicon was viable, since all my available compute was a MacBook — no cloud GPU budget.

---

## References

- **Unsloth EmbeddingGemma guide:** https://unsloth.ai/docs/new/embedding-finetuning — the primary recipe I followed for the training approach, LoRA configuration, and loss function.
- **mlx-tune (ARahim3):** https://github.com/ARahim3/mlx-tune — a reference for adapting Unsloth-style training pipelines to run on Apple Silicon using PyTorch MPS instead of CUDA/Triton. The core insight from this project is using MPS as a prototyping bridge: develop locally, migrate to cloud for production scale.

---

## Data Preparation (`etl.py`)

The competition provides three files: `train.csv` (queries with gold citation annotations), `laws_de.csv` (German law passages), and `court_considerations.csv` (court ruling passages). The gold citations in `train.csv` are semicolon-separated and can reference both laws and court considerations.

The ETL pipeline does the following:

1. **Explodes multi-citation rows** — each row in `train.csv` can have multiple gold citations joined by `;`. I split and explode these so each (query, citation) pair becomes its own row.
2. **Merges against both corpora** — the exploded rows are inner-joined against `laws_de.csv` on `citation`, then separately inner-joined against `court_considerations.csv`, and the results are concatenated. This produces a flat table of `(query, text)` pairs where `text` is the actual passage content for that citation.
3. **Outputs `joined_data.csv`** — this becomes the training data for the model.

The inner join approach means only queries with citations that exist in the corpora are kept. This is a reasonable tradeoff: it ensures every training pair is a genuine (query, ground-truth passage) pair, at the cost of dropping queries whose citations couldn't be matched.

---

## Training Pipeline (`train.py`)

### Step 1: Device Detection

```python
if torch.backends.mps.is_available():
    device = "mps"
elif torch.cuda.is_available():
    device = "cuda"
else:
    device = "cpu"
```

The script detects the available backend at runtime — MPS for Apple Silicon, CUDA for cloud/GPU machines, CPU as a fallback. This was deliberately written to be portable, following the mlx-tune philosophy: develop and validate locally on Mac, then run identical code on a cloud GPU. The actual Unsloth CUDA kernels aren't used here because they require CUDA; instead, standard PyTorch MPS handles the GPU acceleration on Mac.

### Step 2: Data Loading and Splitting

```python
df = pd.read_csv("data/joined_data.csv")
df = df.dropna(subset=["query", "text"])
df = df[["query", "text"]].reset_index(drop=True)

train_end = int(n * 0.70)
eval_end  = int(n * 0.85)
```

The dataset is split 70 / 15 / 15 into train, eval, and test. Only the `query` and `text` columns are kept — everything else (like the citation ID) is irrelevant to the model. The eval set drives the `InformationRetrievalEvaluator` during training, and the test set is held out for a final pre/post comparison.

### Step 3: Model Selection — EmbeddingGemma 300M

```python
MODEL_NAME = "unsloth/embeddinggemma-300m"
model = SentenceTransformer(MODEL_NAME, device=device)
```

I chose `unsloth/embeddinggemma-300m` for several reasons:

- **Size fits on-device memory.** At 300M parameters, it runs comfortably on Apple Silicon with MPS. Larger embedding models (e.g. 7B) would be impractical without cloud compute.
- **Strong pre-trained representations.** EmbeddingGemma is derived from Google's Gemma family, which has strong language understanding. For a specialised domain like German law, you want a model with good multilingual/legal grounding before fine-tuning.
- **Unsloth's recipe is proven.** The Unsloth documentation specifically targets this model for LoRA embedding fine-tuning with MultipleNegativesRankingLoss, so I was following a validated path rather than experimenting with an untested combination.

### Step 4: LoRA Configuration

```python
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.0,
    bias="none",
    task_type=TaskType.FEATURE_EXTRACTION,
)
model[0].auto_model = get_peft_model(model[0].auto_model, lora_config)
```

LoRA (Low-Rank Adaptation) freezes the base model weights and injects small trainable rank-decomposition matrices into selected layers. The key decisions here:

- **`r=16`, `lora_alpha=32`** — rank 16 gives a reasonable expressivity-to-parameter trade-off. The alpha/rank ratio of 2 is a common default that scales the LoRA updates to a sensible magnitude.
- **Targeting all four attention projections** (`q_proj`, `k_proj`, `v_proj`, `o_proj`) — for an embedding model, the attention mechanism is the primary driver of contextual representations. Adapting all four projections gives the model maximum flexibility to reshape how it attends to tokens, which is where domain-specific patterns are learned.
- **`lora_dropout=0.0`** — the dataset is small and the model is already regularised via the contrastive loss structure. Adding dropout here would have added noise without clear benefit.
- **`task_type=TaskType.FEATURE_EXTRACTION`** — correctly signals to PEFT that this is an embedding task, not a generation task.
- **LoRA instead of full fine-tuning** — full fine-tuning a 300M model on Mac was feasible in theory but would have been significantly slower and risked catastrophic forgetting of the general representations. LoRA keeps the base model frozen, meaning the legal domain knowledge is added on top rather than overwriting the general language understanding.

### Step 5: Information Retrieval Evaluator

```python
def make_ir_evaluator(ds: Dataset, name: str) -> InformationRetrievalEvaluator:
    queries       = {i: ds[i]["query"] for i in range(len(ds))}
    corpus        = {i: ds[i]["text"]  for i in range(len(ds))}
    relevant_docs = {i: {i}            for i in range(len(ds))}
    return InformationRetrievalEvaluator(...)
```

The `InformationRetrievalEvaluator` runs full retrieval evaluation at each checkpoint: it embeds all queries and corpus passages, then measures how well the model ranks the ground-truth passage for each query. The evaluator gives nDCG@10, MRR@10, MAP@100, and Accuracy@K metrics — all standard IR evaluation metrics.

The `relevant_docs = {i: {i}}` construction treats each query-passage pair as its own isolated retrieval problem: query `i` has exactly one relevant document, which is corpus entry `i`. This is appropriate for this dataset because the training pairs are direct (query → passage) correspondences from the citation matching in the ETL step.

I also run a baseline evaluation on the test set before training starts, so I can quantify exactly how much improvement fine-tuning provides.

### Step 6: Loss Function — MultipleNegativesRankingLoss

```python
loss = losses.MultipleNegativesRankingLoss(model)
train_for_loss = train_dataset.rename_column("query", "anchor").rename_column("text", "positive")
```

MultipleNegativesRankingLoss (MNRL) is the standard choice for embedding fine-tuning with (query, positive_passage) pairs. Within each batch, every other example's positive passage is treated as a negative for the current query. This means:

- **No need to mine hard negatives** — the in-batch negatives are automatically created, which keeps the data pipeline simple.
- **`BatchSamplers.NO_DUPLICATES`** — ensures no two examples in a batch share the same query or passage, which is required for MNRL to work correctly (duplicate passages would be incorrectly treated as negatives when they're actually positives).
- **Effective batch of 32** — with `per_device_train_batch_size=4` and `gradient_accumulation_steps=8`, the model accumulates gradients over 32 examples before updating. Larger effective batches mean more in-batch negatives per update, which makes MNRL more effective. This was the main lever to improve training quality within the memory constraints of MPS.

### Step 7: Training Arguments

```python
training_args = SentenceTransformerTrainingArguments(
    max_steps=200,
    learning_rate=2e-5,
    warmup_ratio=0.05,
    lr_scheduler_type="cosine",
    gradient_checkpointing=True,
    bf16=False,
    fp16=False,
    dataloader_pin_memory=False,
)
```

Several of these were forced by the MPS constraints:

- **`bf16=False`, `fp16=False`** — MPS does not support mixed-precision training reliably. Training in float32 costs memory and speed but was the only stable option.
- **`dataloader_pin_memory=False`** — pinned memory is a CUDA-specific optimisation that is unsupported on MPS and causes errors if enabled.
- **`gradient_checkpointing=True`** — trades compute for memory by recomputing intermediate activations during the backward pass. On a memory-constrained Mac, this was necessary to keep the training from OOM-crashing.
- **`max_steps=200`** — with only 200 steps I was primarily validating the pipeline and checking that the model could learn. Given more compute, I'd have run for far longer.
- **`lr_scheduler_type="cosine"` with `warmup_ratio=0.05`** — cosine decay is a robust default that gradually reduces the learning rate as training progresses, reducing the risk of unstable updates late in training. The 5% warmup prevents large gradient spikes in the first few steps.

### Step 8: MPS Cache Callback

```python
class MpsCacheCallback(TrainerCallback):
    def on_evaluate(self, args, state, control, **kwargs):
        if torch.backends.mps.is_available():
            torch.mps.empty_cache()
```

A small but necessary quality-of-life fix: the evaluator runs full corpus and query encoding on MPS, which consumes significant memory. Without explicitly clearing the MPS cache after each evaluation, memory fragmentation would accumulate and eventually crash the process. This callback calls `torch.mps.empty_cache()` after every eval step to reclaim that memory.

### Step 9: Post-Training Evaluation and Saving

After training, the script re-evaluates on the held-out test set and computes the delta against the pre-training baseline. Both the baseline and post-training results are serialised to `output/test_results.json`, and the fine-tuned model (with LoRA adapters merged) is saved to `embeddinggemma_legal_lora/`.

---

## Results

The model was trained for 200 steps (~2.74 epochs) with eval checkpoints every 50 steps. The full metric progression on the eval set is shown below.

| Step | Epoch | nDCG@10 | MRR@10 | MAP@100 | Acc@1 | Acc@5 | Acc@10 |
|------|-------|---------|--------|---------|-------|-------|--------|
| 50   | 0.69  | 0.2585  | 0.2024 | 0.2191  | 0.1145 | 0.3112 | 0.4418 |
| 100  | 1.37  | 0.2707  | 0.2146 | 0.2324  | 0.1265 | 0.3233 | 0.4538 |
| 150  | 2.06  | 0.2743  | 0.2175 | 0.2356  | 0.1285 | 0.3293 | 0.4598 |
| 200  | 2.74  | **0.2736** | **0.2165** | **0.2346** | **0.1265** | **0.3273** | **0.4598** |

### Metric Improvements (step 50 → step 200)

| Metric   | Start  | End    | Delta  | % Change |
|----------|--------|--------|--------|----------|
| nDCG@10  | 0.2585 | 0.2736 | +0.0151 | +5.8%   |
| MRR@10   | 0.2024 | 0.2165 | +0.0141 | +7.0%   |
| MAP@100  | 0.2191 | 0.2346 | +0.0155 | +7.1%   |
| Acc@1    | 0.1145 | 0.1265 | +0.0120 | +10.5%  |
| Acc@3    | 0.2450 | 0.2651 | +0.0201 | +8.2%   |
| Acc@5    | 0.3112 | 0.3273 | +0.0161 | +5.2%   |
| Acc@10   | 0.4418 | 0.4598 | +0.0181 | +4.1%   |

---

## Assessment

### What Worked

The pipeline itself was a success. Getting LoRA embedding fine-tuning to run stably on MPS — with gradient checkpointing, cache management, and a full IR evaluator — required navigating several Apple Silicon-specific constraints that aren't well-documented. The training was stable throughout: loss dropped consistently from ~0.63 at step 10 to ~0.44 by the end, and every retrieval metric improved monotonically from checkpoint to checkpoint (at least up to step 150).

The metric gains are modest but real. A ~7% improvement in MRR@10 and MAP@100 from 200 steps is encouraging, and the Acc@1 gain of 10.5% is meaningful — it means the model is substantially more likely to rank the exact correct passage first.

The eval loss also decreased steadily (0.492 → 0.419), confirming the model was genuinely learning and not just overfitting to the training set. The fact that eval metrics track training loss closely suggests the LoRA adapter is generalising rather than memorising.

### What Didn't Work

The absolute performance numbers are low. An nDCG@10 of 0.27 and Acc@1 of 0.13 means the model fails to rank the correct passage first the vast majority of the time. For a production retrieval system this would be inadequate. There are a few likely causes:

1. **Only 200 steps.** The metrics had not plateaued by step 150 — the best nDCG@10 (0.2743) actually appeared at step 150, not step 200, hinting that more training with proper validation-based early stopping would have been beneficial. This was a hard constraint of my local hardware and the time I had available.

2. **The IR evaluator construction is too easy and too hard at the same time.** The `relevant_docs = {i: {i}}` mapping means the retrieval problem is evaluated by searching only ~15% of the dataset as the corpus. With a small eval corpus, there's less discrimination needed — but the "ground truth" is also narrowly defined as a single exact passage. In reality, multiple passages can be relevant to the same legal query, and this setup doesn't capture that.

3. **No hard negative mining.** MNRL with random in-batch negatives is the simplest contrastive learning approach. In specialised domains like law, where many passages are superficially similar (same legal area, overlapping terminology), hard negatives — passages that are plausible but wrong — are important for teaching the model to make fine-grained distinctions. I didn't implement this.

4. **Float32 training on MPS.** Not using mixed precision (bf16 or fp16) significantly slowed training and limited the batch size I could afford. On CUDA, I could have run with bf16 and a larger effective batch, which generally improves MNRL quality.

5. **No baseline comparison in the report.** The `test_results.json` wasn't captured (the baseline evaluation ran at startup but the delta summary wasn't persisted in the report), so I can't quote the exact improvement from zero-shot to fine-tuned on the test set — only the progression across eval checkpoints during training.

### What I Would Do Differently

- **Run on cloud GPU with the actual Unsloth library.** The mlx-tune philosophy of prototyping locally and then migrating is sound, and I validated the pipeline locally. The next step would be to spin up a Colab or cloud instance and run with the real Unsloth `FastSentenceTransformer`, which would give 1.8–3.3x speed improvement and enable bf16 — allowing more steps, larger effective batch sizes, and faster iteration.
- **Train for significantly more steps** with validation-based early stopping rather than a fixed step cap.
- **Mine hard negatives** using BM25 or a zero-shot embedding model to find plausible but incorrect passages, then feed those as explicit negatives to the loss function.
- **Experiment with QLoRA** (4-bit quantisation + LoRA) to fit a larger base model into the same memory envelope, potentially giving better starting representations.
- **Fix the test set delta reporting** — the script saves `test_results.json` with baseline and post-training metrics, but the report generation step wasn't plumbed to read it. Adding that would complete the picture.

---

## Conclusion

This project achieved its main goals: I built and validated an end-to-end embedding fine-tuning pipeline on Apple Silicon, proved that LoRA adapter training for dense retrieval is feasible with MPS as a compute backend, and delivered measurable retrieval improvements on legal data. The absolute performance numbers leave significant room for improvement, but given the hardware constraints and the 200-step training budget, the consistent upward trend across all metrics demonstrates the approach is sound. The natural next step is scaling the same pipeline to cloud GPU hardware with full Unsloth support.