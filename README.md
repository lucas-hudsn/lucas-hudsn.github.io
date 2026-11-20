# lucas-hudsn.github.io

My personal blog and portfolio — static HTML and CSS, no framework, no build step.

## Structure

```
index.html              Homepage: lead story, latest rail, featured stories, projects
posts/<slug>/post.html  Individual posts, with their images alongside
resume/index.html       Resume
assets/css/site.css     All site styles
assets/img/             Shared thumbnails, optimized photos, favicon
404.html                Not-found page
feed.xml                RSS feed
sitemap.xml             Sitemap
```

## Adding a post

1. Create `posts/<slug>/post.html` by copying an existing post and updating the
   `<head>` metadata, `<h1>`, date, reading time and article body.
2. Put any images in the same folder and reference them relatively
   (e.g. `src="screenshot.png"`).
3. Add the post to `index.html` (latest rail and, if featured, the card grid),
   plus the ticker, footer, `feed.xml` and `sitemap.xml`.

New styles go in `assets/css/site.css`. There is no JavaScript and no
dependency to install.

## Local preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deployment

Every push to `main` deploys the static files to GitHub Pages via
`.github/workflows/deploy.yml`.

In the repository settings, Pages must be set to **Source: GitHub Actions**
(Settings → Pages → Build and deployment). The old `gh-pages` branch contains
the retired Quarto build; switch the source if Pages is still pointing there.
