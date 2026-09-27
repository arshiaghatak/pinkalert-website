# Pink Alert · [pinkalert.ai](https://pinkalert.ai)

**Breast health, in your hands.**

Pink Alert is a low-cost, handheld breast ultrasound device paired with an AI assistant that reads each scan as **normal**, **benign** or **malignant** and tells the user, in plain language, whether they are good for now or should see a doctor. It was created by Arshia Ghatak after her own experience with breast cancer as a teenager, to make early breast-health screening accessible to young women who may never be taught what to look for and may not be able to afford a clinical ultrasound.

This repository is the source for the project website, [pinkalert.ai](https://pinkalert.ai).

## What's on the site

- **Home**
  - The problem Pink Alert addresses.
  - An interactive 3D model of the force-guided probe (ultrasound transducer, four force sensors, IMU, controller and battery), with clickable parts.
  - How the analyzer works: 29 engineered image features and a weighted ensemble of Random Forest, MLP and SVM models.
  - Links to the open-source code and the development roadmap.
- **Live Demo:** drag any of 21 real ultrasound scans into the analyzer to see the models' actual outputs, the alert, and the expert tumor outline.
- **Research & Talks:** the TEDxDVHS talk *From Patient to Innovator*, the peer-reviewed paper *Machine Learning Models for Breast Cancer Diagnosis Using Ultrasound Images* (American Journal of Student Research, 2026), and ways to get involved.
- **Founder:** Arshia Ghatak's story and background.

The analyzer itself lives in [breast_ultrasound_analyzer](https://github.com/arshiaghatak/breast_ultrasound_analyzer).

> Pink Alert is a research prototype and educational tool. It is not a medical device, has not been cleared by the FDA, and does not diagnose cancer.

## How it's built

Plain HTML, CSS and a little JavaScript, with no build step. The 3D model uses three.js from a CDN.

```
├── index.html        Home: problem, device, analyzer, open source, roadmap
├── demo.html         Live demo on 21 real scans
├── research.html     TEDx talk, research paper, get involved
├── founder.html      Founder bio
├── assets/css/style.css
├── assets/js/main.js       menu, fade-ins, count-ups, video, copy buttons
├── assets/js/device3d.js   interactive 3D probe (three.js)
├── assets/js/demo.js       drag-and-drop analyzer demo
├── assets/demo/            21 sample scans + results.js (real model outputs, expert outlines)
├── assets/docs/            the published paper (PDF)
├── assets/img/             logo, favicons, headshot, TEDx thumbnail, design sheet
└── robots.txt, sitemap.xml, site.webmanifest, favicon.ico
```

**Demo data:** `assets/demo/results.js` holds the outputs of the published models (RF 60% / MLP 25% / SVM 15%) on 21 images drawn at random from the public BUSI dataset (Al-Dhabyani et al.). 18 of the 21 match the expert label. The images were also used in training, so the demo shows behavior, not an independent test.

## Run it locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## Deployment

Hosted on Vercel from the `main` branch; every push redeploys the site. The domain `pinkalert.ai` is registered with GoDaddy and points to Vercel.

## License

The website's code is released under the [MIT License](LICENSE) © 2026 Arshia Ghatak.

The MIT License does **not** cover the Pink Alert name, logo and brand marks, photos of Arshia Ghatak, or the device design materials. These remain the property of Arshia Ghatak and may not be reused without permission. The research paper and the BUSI sample images keep their own terms. See [LICENSE](LICENSE) for details.
