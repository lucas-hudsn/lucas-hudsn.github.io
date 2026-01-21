# lucas-hudsn.github.io

Personal website and blog built with [Quarto](https://quarto.org/).

**Live site**: https://lucas-hudsn.github.io

## Local Development

### Prerequisites

- [Quarto](https://quarto.org/docs/get-started/)
- [uv](https://github.com/astral-sh/uv) (Python package manager)

### Setup

```bash
# Install Python dependencies
uv sync

# Preview site locally
quarto preview
```

### Building

```bash
quarto render
```

## Deployment

The site is deployed to GitHub Pages. Push to `main` branch to trigger deployment.
