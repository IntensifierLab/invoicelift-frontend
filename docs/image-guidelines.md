# Image guidelines (issue #24)

## Audit result

As of this change, this app has exactly one raster/vector image rendered in
a component: the nav logo in `app/layout.tsx`, already using `next/image`.
There are zero raw `<img>` elements anywhere in `app/` or `components/` —
confirmed with:

```sh
grep -rln "<img" app components --include="*.tsx"
```

So the acceptance criterion "all images use `next/image`" was already true
going into this issue. This change is about making sure it *stays* true and
that the config is actually tuned, rather than adding a `next/image` usage
that didn't need adding.

## What's enforced automatically

`eslint-config-next`'s `next/core-web-vitals` ruleset (already this repo's
base ESLint config, see `.eslintrc.json`) includes
[`@next/next/no-img-element`](https://nextjs.org/docs/messages/no-img-element),
which fails the lint step (and therefore CI) on any raw `<img>` tag. A
future PR that adds one without `next/image` won't merge with a passing
build — no separate guideline doc can enforce that as reliably as the
linter already does.

## What this change adds

- **`next.config.ts`**: an `images` block requesting AVIF first, WebP as a
  fallback, and `deviceSizes` matched to the breakpoints this app's CSS
  grid layouts already use. There were no image-optimization settings
  configured before this — the defaults work, but weren't tuned to this
  app's actual layout.

## Guidance for the next image this app adds

- Use `next/image`, not `<img>` (enforced by lint, see above).
- Set `priority` only on an image that's above the fold and likely to be
  the page's LCP element. The current nav logo is 38×38 and not a serious
  LCP candidate on any page, so it intentionally doesn't set `priority`.
- Prefer a fixed `width`/`height` (or `fill` inside a sized container) over
  an unconstrained image — this avoids layout shift (CLS) and is what
  `next/image` needs to reserve space before the image loads.
- `unoptimized` (used on the current logo, an SVG) is correct for vector
  images — Next's image optimizer only helps with raster formats. Don't
  carry it over to a future raster image without checking it's actually
  needed.
