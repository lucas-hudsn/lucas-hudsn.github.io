# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Quarto-based personal website for Lucas Hudson, deployed to GitHub Pages at https://lucas-hudsn.github.io.

## Tech Stack

- **Quarto**: Static site generator for the blog/website
- **Python**: Used for Jupyter notebook posts
- **uv**: Python package manager (see pyproject.toml and uv.lock)

## Project Structure

```
├── _quarto.yml          # Main Quarto configuration
├── index.qmd            # Homepage with blog listing
├── about.qmd            # About page
├── posts/               # Blog posts directory
│   └── */               # Each post in its own folder
├── _site/               # Generated site output (don't edit)
├── _freeze/             # Frozen computation results
├── .quarto/             # Quarto cache/metadata
└── styles.css           # Custom CSS styles
```

## Common Commands

```bash
# Preview site locally
quarto preview

# Render site
quarto render

# Install Python dependencies
uv sync
```

## Development Notes

- Blog posts go in `posts/` directory, each in its own subfolder
- Posts can be `.qmd` (Quarto markdown) or `.ipynb` (Jupyter notebooks)
- The site uses the `cosmo` theme with custom brand styling
- Do not edit files in `_site/` - they are auto-generated
