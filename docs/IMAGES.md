# Image guide — which picture goes where

Export every photo as **WebP** (quality 70–80), keep the file names below, and always set `width` and `height` in HTML. Keep originals (PNG/PSD) outside the repo. For each slot, prefer the **2× size** shown.

| Slot | Where it appears | Best kind of image | Size (px) | File |
| --- | --- | --- | --- | --- |
| Logo (master) | print, partners | the vector logo | — | `assets/img/logo.svg` |
| Logo (site) | header, footer | full logo with the lady, transparent | 420 × 350 | `assets/img/logo.webp` |
| Social share | WhatsApp / LinkedIn / Facebook previews | the "Nature's Table. Naturally." banner | 1200 × 630 | `assets/img/og-image.jpg` |
| Home hero (mobile) | under the Home hero text, below 1120 px | temple scene, square-ish | 1000 / 800 / 640 wide | `assets/img/hero-scene-*.webp` |
| Home hero (desktop) | full-width panorama behind the Home hero text, 1120 px and up | the Gopuram Vatika panorama **without text**. The current file has the original lettering painted out by script (some soft haze bottom-left); swap in a clean text-free export from the designer when available | 2560 / 1920 / 1280 wide (3884:1618) | `assets/img/hero-wide-*.webp` |
| Category circles | Home "Explore Our Range", product filter | one illustrated item per category on a pastel circle | 240 × 240 | `assets/img/categories/*.webp` |
| Product photos | product cards and product pages | **square** photo of a single piece on a plain cream background, soft shadow | 800 × 800 | `assets/img/products/<product-id>.webp`, then set `image:` in `catalog.js` |
| EcoBhoj box | Home banner, EcoBhoj page | the 3D box render | 640 / 900 / 1200 wide | `assets/img/ecobhoj-box-*.webp` |
| Inner page heroes | right side of the hero card on Our Story, Products, Sustainability, Certifications (desktop only) | transparent illustration, **no text**, cropped from a campaign banner | 480 / 800 wide | `assets/img/pages/<page>-*.webp` |
| Campaign banners | Home (Dining the Earthens Way), Sustainability (Your Plate. Their Life.), EcoBhoj (Good Vibes. Great Bites.) | full transparent banner; the message is drawn in, so the `alt` repeats it word for word | 800 / 1280 wide | `assets/img/banners/<name>-*.webp` |
| EcoBhoj front & back | EcoBhoj "A box worth keeping" | flat front + back render on dark green | 640 / 1200 wide | `assets/img/ecobhoj-front-back-*.webp` |
| Artisans | Home "Crafted by 48 women", Our Story | real photo of the women at work (with their consent) | 1200 × 960 (5:4) | replace the `[ Photo … ]` placeholders |
| Family | Our Story "The people behind Earthens" | individual portraits | 400 × 400 | replace the initials |
| Awards | Our Story / Certifications | photo of each award or ceremony (optional) | 800 × 600 | add `image` to `AWARDS` |
| Instagram posts | future "From our Instagram" strip | square posts | 600 × 600 | `assets/img/instagram/` |

## Instagram images: good uses
- **Lifestyle shots** (food served on plates, parties, poojas) → Home "Made for every celebration" cards and the EcoBhoj page.
- **Close-ups of a single product** → that product's page (`image:` in `catalog.js`).
- **Behind the scenes** (leaves drying, pressing, packing) → Sustainability life cycle and the Certifications "Five checkpoints".
- **People** → Our Story.

Avoid images with text baked in for anything except the social-share image: real HTML text is better for SEO, translation and accessibility.

## How we export (keeps the site light)
Originals live in `Earthens New Website Design/` (git-ignored). Export with `cwebp` (`sudo apt install webp`):

```bash
# transparent illustration: lossy colour + lossy alpha (alpha alone is ~35% of the file otherwise)
cwebp -q 65 -alpha_q 60 -alpha_filter best -m 6 -sharp_yuv -metadata none \
      -crop X Y W H -resize 800 0 source.png -o assets/img/pages/name-800.webp
```
Aim for under 150 KB at the largest size. Every image is `loading="lazy"` except the Home hero.
