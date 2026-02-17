# www.liamskinner.co.uk

> The source code for my personal website, hosted at [www.liamskinner.co.uk](https://www.liamskinner.co.uk).

This repository houses a dual-mode personal portfolio and CV, bridging the gap between two very different worlds: **Outdoor Instruction** and **Cyber Security**.

## 🌲 vs 🔐 The Concept

The core feature of homepage is a context-switch toggle. Depending on the user's selection, the site renders two completely different versions of my professional history:

* **Cyber Mode:** Focuses on technical skills, certifications, and security research.
* **Outdoor Mode:** Focuses on adventure training, coaching qualifications, and professional leadership.

Additionally, the `/portfolio` section serves as a knowledge base, summarising security writeups, CTF walkthroughs, and lab reports.

## 🛠️ The Stack: Custom SSG

Rather than using a heavy framework like Next.js or a pre-built tool like Jekyll, this site is built with a **custom, lightweight Static Site Generator written in vanilla JavaScript**.

It parses raw content (Markdown/JSON), applies templates, and renders static HTML ready for deployment.

### Key Features
* **Zero Client-Side Bloat:** No massive hydration bundles; just semantic HTML and CSS.
* **Togglable Content Engine:** Custom logic to filter content based on the selected "career mode."

## 🚀 Getting Started

To download this project locally:

```bash
git clone https://github.com/thatsliams/my-site
cd my-site
npm install
```

## 📂 Project Structure

```text
.
├── src/
│   ├── content/        # Writeups and JSON data
│   ├── templates/      # HTML logic for the custom SSG
│   └── assets/         # CSS, Images, and Fonts
├── public/             # Compiled output (ignored by Git)
└── .github/            # CI/CD and Community files
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

* We adhere to a specific **[Commit Convention]()**.
* This project is governed by a **[Code of Conduct]()**.

## 📝 License

This project is open source and available under the [MIT License]().
