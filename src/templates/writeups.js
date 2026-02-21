const path = require('path');

const globalContent = require('../content/global.json');

const { escapeHTML, ensureArray, joinHTML, formatDate, toTitleCase } = require('./lib/utils');
const { saveToFile, getAllWriteups } = require('./lib/fileUtils');
const { renderContentBlock } = require('./lib/blockParser');
const { headTag, navTag, footerTag } = require('./lib/components');

/**
 * @function
 * @summary Generates the writeup header containing metadata such as title, date, and difficulty.
 *
 * @param {Object} dynamic - The JSON data representing the writeup. Expected keys: title, date, difficulty, platform, category, and tags.
 * @returns {string} The formatted HTML string for the header element.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const introTag = (dynamic) => {
	const tagsHTML = ensureArray(dynamic.tags)
		.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`)
		.join('');

	const formattedDate = formatDate(dynamic.date, 'short');
	const diffSlug = (dynamic.difficulty || 'medium').toLowerCase();
	const formattedDiff = toTitleCase(diffSlug);

	return `
		<header class="card writeup-header difficulty-border-${diffSlug}">
			<span class="category-tag">
				${escapeHTML(dynamic.platform)} ${escapeHTML(dynamic.category)} Writeup
			</span>

			<h1>${escapeHTML(dynamic.title)}</h1>

			<p class="subtitle">
				Published: ${formattedDate}
				• Difficulty:
				<span class="${escapeHTML(dynamic.difficulty)}">
					${escapeHTML(formattedDiff)}
				</span>
			</p>
			
			${tagsHTML && `<div class="tag-container">${tagsHTML}</div>`}
		</header>
	`;
};

/**
 * @function
 * @summary Generates the core article body by rendering all associated content cards.
 *
 * @param {Object} dynamic - The JSON data representing the writeup, specifically requiring a 'cards' array containing content blocks.
 * @returns {string} The formatted HTML string containing the rendered articles.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const articleTag = (dynamic) => {
	const articles = ensureArray(dynamic.cards).map(card => {
		const content = ensureArray(card)
			.map(renderContentBlock)
			.join('\n');
		return `<article class="card writeup-content">${content}</article>`;
	});

	return articles.join('\n');
};

/**
 * @function
 * @summary Assembles the complete HTML page structure for a single writeup.
 *
 * @param {Object} dynamic - The parsed JSON data object. Requires keys: title, summary, nav, and data for the intro and article sections.
 * @returns {string} The final, fully formatted HTML document string.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const generateContent = (dynamic) => {
	const headInfo = {
		title: `Writeup: ${escapeHTML(dynamic.title)} | ${escapeHTML(globalContent.site.author.fullName)}`,
		author: globalContent.site.author.fullName,
		summary: dynamic.summary,
		base_url: globalContent.site.base_url,
		stylesheets: ['writeups'],
		javascripts: ['navbar'],
	};

	const navInfo = {
		left: ['/portfolio', './Portfolio'],
		right: dynamic.nav,
	};

	return joinHTML([
		'<!DOCTYPE html>',
		'<html lang="en-GB">',
		headTag(headInfo),
		'<body>',
		navTag(navInfo),
		'<div class="container">',
		introTag(dynamic),
		articleTag(dynamic),
		footerTag(),
		'</div>',
		'</body>',
		'</html>',
	]);
};

/**
 * @function
 * @summary The main execution pipeline that loops through all JSON files in the writeups content folder to generate individual HTML pages.
 *
 * @param {string} destination - The base target directory path. The function will automatically append the 'writeups/' sub-directory.
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
module.exports = (destination) => {
	try {
		getAllWriteups()
			.forEach(file => {
				const html = generateContent(file);

				saveToFile(
					html,
					path.join(destination, 'writeups/'),
					file.id,
				);
			});
	}
	catch (error) {
		console.error('CRITICAL Error within writeups.js pipeline:', error.message);
	}
};
