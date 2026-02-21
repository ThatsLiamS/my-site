const globalContent = require('../content/global.json');

const { escapeHTML, joinHTML } = require('./lib/utils');
const { saveToFile } = require('./lib/fileUtils');

/**
 * @function
 * @summary Generates the HTML head section specifically for the 404 error page.
 *
 * @returns {string} The formatted HTML string representing the <head> element.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderHead = () => `
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">

	<title>Page Not Found | ${escapeHTML(globalContent.site.author.fullName)}</title>

	<link rel="stylesheet" href="/assets/style/global.css">
	<link rel="stylesheet" href="/assets/style/not-found.css">
</head>
`;

/**
 * @function
 * @summary Generates the HTML for the 404 error card content, including the compass SVG and message.
 *
 * @returns {string} The formatted HTML string for the 404 error card.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderErrorCard = () => {
	return `
	<div class="card error-card">
		<svg class="compass-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
		</svg>

		<h1>404</h1>

		<h2>Off the Map?</h2>

		<p>
			Looks like you've ventured a bit too far off-trail. 
			The page you are looking for doesn't exist or has been moved.
		</p>

		<a href="/" class="btn">Return to Base</a>
	</div>
	`;
};

/**
 * @function
 * @summary Assembles the complete HTML structure for the 404 page.
 *
 * @returns {string} The complete, concatenated HTML document string.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const generateContent = () => {
	return joinHTML([
		'<!DOCTYPE html>',
		'<html lang="en-GB">',
		renderHead(),
		'<body class="full-height">',
		renderErrorCard(),
		'</body>',
		'</html>',
	]);
};

/**
 * @function
 * @summary Generates the 404 page content and saves it as an HTML file in the specified destination.
 *
 * @param {string} destination - The directory path where the '404.html' file will be saved.
 * @throws {Error} Throws an error if generating the HTML or saving to the filesystem fails.
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const build404Page = (destination) => {
	try {
		const html = generateContent();
		saveToFile(html, destination, '404');
	}
	catch (err) {
		console.error('Error generating 404 page:', err.message);
		throw err;
	}
};

/**
 * @function
 * @summary The main execution pipeline for building the 404 Not Found page.
 *
 * @param {string} destination - The target directory path for the build output.
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
module.exports = (destination) => {
	try {
		build404Page(destination);
	}
	catch (error) {
		console.error('CRITICAL Error within not_found.js pipeline:', error.message);
	}
};
