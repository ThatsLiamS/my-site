const globalContent = require('../../content/global.json');

const { escapeHTML } = require('./utils');

/**
 * @function
 * @summary Generates the HTML head section with meta tags, title, and stylesheets.
 *
 * @param {Object} information - An object containing page-specific metadata (title, author, summary, base_url, style_name).
 * @returns {string} The formatted HTML string representing the <head> element.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const headTag = (information) => {
	const title = escapeHTML(information.title);
	const author = escapeHTML(information.author);
	const summary = escapeHTML(information.summary);
	const baseUrl = escapeHTML(information.base_url);
	const style_name = escapeHTML(information.style_name);


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
		<link rel="stylesheet" href="/assets/style/${style_name}.css">

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
 * @function
 * @summary Generates the HTML navigation bar with links and social icons.
 *
 * @param {Object} information - An object containing navigation details (left logo data, centre links).
 * @returns {string} The formatted HTML string representing the <nav> element.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const navTag = (information) => {
	const navLinksHTML = information.centre
		.map(link => `<li><a href="${link[0]}">${escapeHTML(link[1])}</a></li>`)
		.join('\n');

	return `
	<nav class="navbar">
		<div class="nav-container">
			<a href="${information.left[0]}" class="nav-logo">
				${escapeHTML(information.left[1])}
			</a>

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
	<footer>
		&copy; ${new Date().getFullYear()} ${escapeHTML(globalContent.site.author.fullName)}.
		All rights reserved.
	</footer>
`;

module.exports = {
	headTag,
	navTag,
	footerTag,
};
