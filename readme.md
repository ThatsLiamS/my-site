# Portfolio Website

> The source code for my personal cyber security portfolio, hosted at [www.liamskinner.co.uk](https://www.liamskinner.co.uk).

This repository houses my professional portfolio and CV, dedicated entirely to the world of **Cyber Security** and **Offensive Security**. 

## 🔐 The Concept

Designed with a dark-theme aesthetic that leans into offensive security culture, the site serves as a central hub for my professional history, technical skills, and certifications. 

Additionally, the `/portfolio` section acts as an active knowledge base, summarising:
* Security writeups and vulnerability research
* CTF (Capture The Flag) walkthroughs
* Lab reports and technical documentation

## 🛠️ The Stack: Custom SSG

Rather than using a heavy framework like Next.js or a pre-built tool like Jekyll, this site is built with a **custom, lightweight Static Site Generator written in vanilla JavaScript**.

It parses raw content (Markdown/JSON), applies templates, and renders static HTML ready for deployment.

### Key Features
* **Zero Client-Side Bloat:** No massive hydration bundles; just semantic HTML and CSS.
* **Static Content Engine:** Custom logic to parse, organize, and render my JSON-based security writeups into a highly readable format.

## 🚀 Getting Started

To download this project locally:

```bash
git clone https://github.com/ThatsLiamS/my-site
cd my-site
npm install
```

## 📂 Project Structure

```text
.
├── src/
│   ├── content/        # Security writeups, CTF walkthroughs, and JSON data
│   ├── templates/      # HTML logic for the custom SSG
│   └── assets/         # CSS (Dark Theme), JS, and Images
├── public/             # Compiled output (ignored by Git)
└── .github/            # CI/CD and Community files
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

* We adhere to a specific **[Commit Convention]()**.
* This project is governed by a **[Code of Conduct]()**.

## 📝 License

This project is open source and available under the [MIT License]().
