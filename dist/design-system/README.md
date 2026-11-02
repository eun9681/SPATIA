# SPATIA · Vellum & Cyanotype

User-provided design references, reviewed 2026-11-03:

- Landing: https://claude.ai/artifact/7KdNBabk1xGmjqDbLceyNo#page-2e9cfe98992d
- Simplified workspaces: https://claude.ai/artifact/7KdNBabk1xGmjqDbLceyNo#page-66a499534a48
- Design system: https://claude.ai/artifact/W4844DyHoDrYLrLcvnbU83#readme

`tokens.css` and `components.css` are the supplied system's visible original CSS. `vellum.css` maps its tokens and surface treatment to the existing static application. `interface.js` adapts navigation while retaining existing event handlers. `building-vellum.svg` is an original vector illustration constructed from repeated floor geometry.

The landing uses the reference's architectural presentation with a gentle, eight-second floor separation loop. The inline SVG retains the original floor geometry, disables motion with prefers-reduced-motion. The older scroll-entry hero assets remain available in the repository but are not loaded by this landing. Model rotation, floor separation, importing, selection, relation queries, scoring and role workflows remain in the functional workspaces. Reference scores and request fixtures have not replaced application data.

Typography: IBM Plex Sans KR, Archivo and IBM Plex Mono, loaded by the supplied CSS with system font fallbacks. The application does not add the reference's React dependency; working controls retain their current vanilla JavaScript implementation.
