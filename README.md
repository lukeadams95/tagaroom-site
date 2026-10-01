# TAG-A-ROOM® Homepage

Static implementation of `design-handoff/project/Homepage.dc.html` from the Claude Design handoff bundle.
Plain HTML, CSS and vanilla JS, with no build step.

```
./
  index.html     markup and all content (nav, categories, reviews, posts)
  styles.css   design tokens and layout; breakpoints at 480 / 600 / 640 / 900 / 1100px
  main.js      mobile menu, cart counter + qty, category search, review carousel
               + read more, draggable logo marquee
  assets/      images with clean filenames (logos/, categories/, icons/, blog/)
  design-handoff/  original Claude Design export (prototype, chat transcripts, source uploads)
```

Preview locally: `python3 -m http.server` (from the repo root) and open http://localhost:8000.

All links are `#` placeholders, and the cart count only lives in the page (no backend).
