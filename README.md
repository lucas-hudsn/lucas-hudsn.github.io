# lucas-hudsn.github.io

Personal portfolio and technical blog built with [Quarto](https://quarto.org/), deployed to GitHub Pages.

**Live site**: https://lucas-hudsn.github.io

---

## About

I'm Lucas Hudson — Data Scientist and Full Stack AI Engineer. This site documents my projects across ML, deep learning, and applied AI engineering. Posts range from full-stack application walkthroughs to ML competition write-ups with full implementation detail.

---

## Posts

| Post | Category | Description |
|------|----------|-------------|
| [Fine-Tuning EmbeddingGemma-300M for Legal Retrieval](posts/legal_retrieval_kaggle/) | ML | LoRA fine-tuning of a dense retrieval model on German legal data, run entirely on Apple Silicon MPS. Includes full training pipeline, IR evaluator, and results analysis. |
| [NCC Bot](posts/NCC_bot/) | AI / Full Stack | Agentic RAG system for querying the Australian National Construction Code. PydanticAI agent with self-grading retrieval loop, ChromaDB vector store, and FastAPI backend. |
| [Kaggle Code Agent](posts/kaggle-code/) | AI | Autonomous CLI agent that solves Kaggle competitions using the Ralph Wiggum loop — iterative AI execution with error feedback and state persistence via Git. |
| [wave~reader](posts/wave~reader/) | AI / Full Stack | Full-stack surf forecast app covering 50+ Australian breaks. FastAPI backend, SQLite, Google Gemini AI reports, and dynamic SVG charts. |
| [wave~reader Data Generation](posts/wave~reader_datagen/) | AI Engineering | Prompt engineering deep-dive: zero-shot vs one-shot strategies for generating structured surf break data at scale with Gemini. |
| [Hello World](posts/hello-world/) | Blog | Introduction post outlining the goals and focus of this site. |

---

## Local Development

**Prerequisites**: [Quarto](https://quarto.org/docs/get-started/), [uv](https://github.com/astral-sh/uv)

```bash
# Install Python dependencies
uv sync

# Preview site with live reload
quarto preview

# Build static site
quarto render
```

Output goes to `_site/` — do not edit directly.

---

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that renders and deploys the site to the `gh-pages` branch.
