const path = require('path');

const globalContent = require('../content/global.json');

const { escapeHTML, ensureArray, joinHTML, toTitleCase, mapStatusToDifficulty } = require('./lib/utils');
const { saveToFile, getAllProjects } = require('./lib/fileUtils');
const { renderContentBlock } = require('./lib/blockParser');
const { headTag, navTag, footerTag } = require('./lib/components');

/**
 * @function
 * @summary Generates the project header containing metadata such as title, date, and difficulty.
 *
 * @param {Object} project - The JSON data representing the project. Expected keys: title, date, difficulty, platform, category, and tags.
 * @returns {string} The formatted HTML string for the header element.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const introTag = (project) => {
	const tagsHTML = ensureArray(project.tags)
		.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`)
		.join('');

	const status = escapeHTML(project.status || 'Unknown');
	const statusClass = mapStatusToDifficulty(status);

	const formattedDate = project.date;

	const descriptionHTML = ensureArray(project.description.onpage)
		.map(renderContentBlock)
		.join('\n');

	return `
		<header class="card project-header difficulty-border-${statusClass}">
			<span class="category-tag">
				Project
			</span>

			<h1>${escapeHTML(project.title)}</h1>

			<p class="subtitle">
				<span class="difficulty-badge">
					${formattedDate}
				</span>
				• Status:
				<span class="${statusClass}">
					${toTitleCase(status)}
				</span>
			</p>
			
			${tagsHTML && `<div class="tag-container">${tagsHTML}</div>`}

			${descriptionHTML && `<div class="description-container">${descriptionHTML}</div>`}
		</header>
	`;
};

/**
 * @function
 * @summary Generates the core article body by rendering all associated content cards.
 *
 * @param {Object} dynamic - The JSON data representing the project, specifically requiring a 'cards' array containing content blocks.
 * @returns {string} The formatted HTML string containing the rendered articles.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const articleTag = (dynamic) => {
	const articles = ensureArray(dynamic.cards).map(card => {
		const content = ensureArray(card)
			.map(renderContentBlock)
			.join('\n');
		return `<article class="card project-content">${content}</article>`;
	});

	return articles.join('\n');
};

/**
 * @function
 * @summary Assembles the complete HTML page structure for a single project.
 *
 * @param {Object} dynamic - The parsed JSON data object. Requires keys: title, summary, nav, and data for the intro and article sections.
 * @returns {string} The final, fully formatted HTML document string.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const generateContent = (dynamic) => {
	const headInfo = {
		title: `Project: ${escapeHTML(dynamic.title)} | ${escapeHTML(globalContent.site.author.fullName)}`,
		author: globalContent.site.author.fullName,
		summary: dynamic.description.meta,
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
		'</div>',
		footerTag(),
		'</body>',
		'</html>',
	]);
};

/**
 * @function
 * @summary The main execution pipeline that loops through all JSON files in the projects content folder to generate individual HTML pages.
 *
 * @param {string} destination - The base target directory path. The function will automatically append the 'projects/' sub-directory.
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
module.exports = (destination) => {
	try {
		getAllProjects()
			.forEach(file => {
				const html = generateContent(file);

				saveToFile(
					html,
					path.join(destination, 'projects/'),
					file.id,
				);
			});
	}
	catch (error) {
		console.error('CRITICAL Error within projects.js pipeline:', error.message);
	}
};
