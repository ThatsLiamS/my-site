const globalContent = require('../../content/global.json');

const { escapeHTML } = require('./utils');

/**
 * @function
 * @summary Generates the HTML head section with meta tags, title, and stylesheets.
 *
 * @param {Object} information - An object containing page-specific metadata (title, author, summary, base_url, stylesheets).
 * @returns {string} The formatted HTML string representing the <head> element.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const headTag = (information) => {
	const title = escapeHTML(information.title);
	const author = escapeHTML(information.author);
	const summary = escapeHTML(information.summary);
	const baseUrl = escapeHTML(information.base_url);

	const stylesheet = (information.stylesheets || [])
		.map((name) => {
			const sheetName = escapeHTML(name);
			return `<link rel="stylesheet" href="/assets/style/${sheetName}.css"></link>`;
		})
		.join('\n');

	const javascript = (information.javascripts || [])
		.map((name) => {
			const scriptName = escapeHTML(name);
			return `<script src="/assets/script/${scriptName}.js" defer></script>`;
		})
		.join('\n');;

	return `
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">

		<title>${title}</title>
		<meta name="description" content="${summary}">
		<meta name="author" content="${author}">
		<link rel="canonical" href="${baseUrl}">

		<meta name="robots" content="index, follow">
		<meta name="googlebot" content="index, follow">

		<meta property="og:type" content="website">
		<meta property="og:title" content="${title}">
		<meta property="og:description" content="${summary}">
		<meta property="og:url" content="${baseUrl}">
		<meta property="og:site_name" content="${author}">
		<meta property="og:locale" content="en_GB">

		<meta name="theme-color" content="#0a66c2">
		<meta name="color-scheme" content="light">

		<link rel="icon" type="image/webp" href="/assets/images/icon.webp">
		<link rel="stylesheet" href="/assets/style/global.css">
		${stylesheet}
		${javascript}

		<meta http-equiv="Content-Security-Policy" content="
			default-src 'self';
			img-src 'self' data:;
			script-src 'self';
			style-src 'self' 'unsafe-inline';
			font-src 'self';
			connect-src 'self';
			frame-ancestors 'none';
			base-uri 'self';
			form-action 'self';
		">

		<meta http-equiv="X-Content-Type-Options" content="nosniff">
		<meta http-equiv="X-Frame-Options" content="DENY">
		<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">

		<meta http-equiv="Content-Language" content="en-GB">
	</head>
	`;
};

/**
 * @constant {string}
 * @summary The HTML tags for the classic hamburger symbol.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const hamburgerHtml = `
<input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle navigation">
<label for="nav-toggle" class="hamburger">
	<span class="bar"></span>
	<span class="bar"></span>
	<span class="bar"></span>
</label>
`;

/**
 * @function
 * @summary Generates the HTML navigation bar with links and social icons.
 *
 * @param {Object} information - An object containing navigation details (left data, & right links).
 * @returns {string} The formatted HTML string representing the <nav> element.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const navTag = (information) => {
	const navLinksHTML = information.right
		.map(link => `<li><a href="${link[0]}">${escapeHTML(link[1])}</a></li>`)
		.join('\n');

	const hamburger = navLinksHTML.length > 0 ? hamburgerHtml : '';

	return `
	<nav class="navbar">
		<div class="nav-container">
			<a href="${information.left[0]}" class="nav-logo">
				${escapeHTML(information.left[1])}
			</a>
			${hamburger}
			<ul class="nav-links">
				${navLinksHTML}
			</ul>
		</div>
	</nav>
	`;
};

/**
 * @function
 * @summary Generates the HTML footer section with copyright information.
 *
 * @returns {string} The formatted HTML string representing the <footer> element.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const footerTag = () => `
	<footer class="site-footer">
		<div class="footer-container">
			<div class="footer-links">
				<a href="/">~/Home</a>
				<a href="/portfolio">~/Portfolio</a>
				<a href="/github" target="_blank" rel="noopener noreferrer">./GitHub</a>
				<a href="/linkedin" target="_blank" rel="noopener noreferrer">./LinkedIn</a>
			</div>
			
			<div class="footer-meta">
				<p>© ${new Date().getFullYear()} ${escapeHTML(globalContent.site.author.fullName)}. All rights reserved.</p>
				<p class="terminal-exit"><span class="prompt">$</span> exit</p>
			</div>
		</div>
	</footer>
`;

module.exports = {
	headTag,
	navTag,
	footerTag,
};
