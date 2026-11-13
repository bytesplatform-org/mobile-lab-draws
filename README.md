# True Lab Results: homepage redesign (demo)

A redesign of the homepage of [mobilelabdraws.org](https://mobilelabdraws.org) for True Lab
Results and Mobile Service LLC (mobile phlebotomy, lab draws and drug testing, Fayetteville, GA).
It keeps the client's content, word for word, and gives it a motion-led design, "Clinical
Liquid": ink-teal and clinical-ivory sheets, the blood-collection tube-cap colour code as the
accent system, and motion that fills, draws, flows and settles.

Next 16 (App Router, Cache Components) · React 19 · Tailwind 4 · GSAP 3.15 (ScrollTrigger,
SplitText, Flip) · Lenis · Three.js.

```bash
npm install
npm run dev            # http://localhost:3000
npm run lint
npm run build
npm run check:content  # after a build: every string in lib/content/site.ts is on the page
```

## Where things are

- `lib/content/site.ts`: every word on the page, verbatim from the live site. Components render only from it.
- `app/page.tsx`: the sections, in the live site's order. `components/home/*` holds the sections, `components/site/*` the page furniture (loader, nav, footer, reveals, cursor, film trail).
- `lib/gl/*` and `lib/shaders/*`: the WebGL (one Three renderer per canvas): the fluid headline, the pointer's film trail, the developing photo plates and the credential seal.
- `lib/animation/*`: GSAP registration (`gsap.ts`, the only place plugins are registered), Lenis, the shared intro timeline, magnets.
- `app/actions/*`: the appointment request and sign-up Server Actions.

## Email delivery

The appointment form and sign-up deliver through [Resend](https://resend.com) when these are set:

```
RESEND_API_KEY=…
INQUIRY_TO=truelabresults@mobilelabdraws.org
INQUIRY_FROM=…            # a sender on a domain verified with Resend
```

Until then they say so honestly and offer a ready-made email and the phone number. They never
claim a request was sent unless the server confirmed it.

## Before launch

Search the code for `TODO(client)`. In particular, replace the photographs: most are GoDaddy stock,
licensed for GoDaddy sites only (see `public/images/CREDITS.md`).
