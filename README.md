# pinkalert.ai

Static website for Pink Alert: plain HTML, CSS and a little JavaScript. No build step.

```
site/
├── index.html        Home: device, analyzer, open source, roadmap
├── impact.html       TEDx talk, research, get involved
├── founder.html      Meet the founder
├── assets/css/style.css
├── assets/js/main.js       menu, copy buttons, lightbox, video
├── assets/js/device3d.js   interactive 3D probe (three.js)
├── assets/js/demo.js       drag-and-drop analyzer demo
├── assets/demo/            21 sample scans + results.js (real model outputs)
├── assets/img/       logos, favicons, share image, sample scans, design sheet
├── CNAME             pinkalert.ai (used by GitHub Pages)
└── robots.txt, sitemap.xml, site.webmanifest, favicon.ico
```

## Preview locally

```bash
python3 -m http.server 4173 --directory site
```

Then open http://localhost:4173.

## Things to fill in

- **Accuracy figure** (`index.html`, search `TODO(Arshia)`): shows "~85%" with a dashed outline until the final number is confirmed.
- **Founder photo** (`founder.html`, search `TODO(Arshia)`): drop a photo at `assets/img/arshia.jpg` and swap it in.
- **Founder bio** (`founder.html`): a draft written from the TEDx talk, paper and prototype doc. Edit freely.

## Going live on pinkalert.ai

Any static host works. Two easy options:

- **GitHub Pages**: push the contents of `site/` to a repo, enable Pages, and keep the `CNAME` file. At your domain registrar, point `pinkalert.ai` to GitHub Pages (A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and add a `www` CNAME to `<username>.github.io`.
- **Netlify / Cloudflare Pages / Vercel**: drag and drop the `site/` folder, then add `pinkalert.ai` as a custom domain and follow the DNS steps they show.

## Demo data

`assets/demo/results.js` holds the outputs of the published models from the GitHub repo (RF 60% / MLP 25% / SVM 15%) on 21 images drawn at random (seeds 2026 and 2027) from the BUSI dataset. 18 of 21 match the expert label. The images were also used in training, so the demo shows behavior, not an independent test.

Brand: logo pink `#EC648C` (text pink `#C2356A`), fonts Newsreader (headings), IBM Plex Sans (body) and IBM Plex Mono (labels).
