const path = require('path');
const globalContent = require('../content/global.json');

const { renderContentBlock } = require('./lib/blockParser');
const { headTag, navTag, footerTag } = require('./lib/components');
const { fetchStats, fillPlaceholders } = require('./lib/fetchStats');
const { saveToFile, getAllProjects, getAllWriteups } = require('./lib/fileUtils');
const {
	escapeHTML,
	ensureArray,
	joinHTML,
	toTitleCase,
	mapStatusToDifficulty,
	formatDate,
} = require('./lib/utils');

/**
 * @function
 * @summary Generates the header containing metadata such as title, date, and difficulty/status.
 *
 * @param {Object} data - The JSON data representing the item.
 * @param {string} type - The type of content ('project' or 'writeup').
 *
 * @returns {string} The formatted HTML string for the header element.
 */
const introTag = (data, type) => {
	const { tags, description, title, status, date, difficulty, platform, category } = data;

	const tagsHTML = ensureArray(tags)
		.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`)
		.join('');

	const descHTML = ensureArray(description?.onpage)
		.map(renderContentBlock)
		.join('\n');

	let categoryTag = '';
	let subtitleHTML = '';
	let diffClass = '';

	if (type === 'project') {
		const safeStatus = escapeHTML(status || 'Unknown');

		diffClass = mapStatusToDifficulty(safeStatus);
		categoryTag = 'Project';
		subtitleHTML = `
			<span>${escapeHTML(date)}</span>
			• Status: <span class="${diffClass}">${toTitleCase(safeStatus)}</span>
		`;
	}
	else if (type === 'writeup') {
		const safeDiff = escapeHTML(difficulty || 'medium').toLowerCase();
		const formattedDate = formatDate(date, 'short');

		diffClass = safeDiff;
		categoryTag = `${escapeHTML(platform)} ${escapeHTML(category)} Writeup`;
		subtitleHTML = `
			<span>Published: ${formattedDate}</span>
			• Difficulty: <span class="${safeDiff}">${toTitleCase(safeDiff)}</span>
		`;
	}

	return `
		<header class="card ${type}-header difficulty-border-${diffClass}">
			<span class="category-tag">${categoryTag}</span>
			<h1>${escapeHTML(title)}</h1>

			${subtitleHTML ? `<p class="subtitle">${subtitleHTML}</p>` : ''}
			${tagsHTML ? `<div class="tag-container">${tagsHTML}</div>` : ''}
			${descHTML ? `<div class="description-container">${descHTML}</div>` : ''}
		</header>
	`;
};

/**
 * @function
 * @summary Generates the core article body by rendering all associated content cards.
 *
 * @param {Object} data - The JSON data representing the item.
 *
 * @returns {string} The formatted HTML string containing the rendered articles.
 */
const articleTag = (data) => {
	return ensureArray(data.cards)
		.map(card => {
			const content = ensureArray(card).map(renderContentBlock).join('\n');
			return `<article class="card content">${content}</article>`;
		})
		.join('\n');
};

/**
 * @function
 * @summary Assembles the complete HTML page structure for a single project or writeup.
 *
 * @param {Object} data - The parsed JSON data object.
 * @param {string} type - The type of content ('project' or 'writeup').
 *
 * @returns {string} The final, fully formatted HTML document string.
 */
const generateContent = (data, type) => {
	const titlePrefix = toTitleCase(type);
	const authorName = escapeHTML(globalContent.site.author.fullName);

	const headInfo = {
		title: `${titlePrefix}: ${escapeHTML(data.title)} | ${authorName}`,
		author: authorName,
		summary: data.description?.meta,
		base_url: globalContent.site.base_url,
		stylesheets: ['portfolioContent'],
		javascripts: ['navbar'],
	};

	const navInfo = {
		left: ['/portfolio', './Portfolio'],
		right: data.nav,
	};

	const html = joinHTML([
		'<!DOCTYPE html>',
		'<html lang="en-GB">',
		headTag(headInfo),
		'<body>',
		navTag(navInfo),
		'<div class="container">',
		introTag(data, type),
		articleTag(data, type),
		'</div>',
		footerTag(),
		'</body>',
		'</html>',
	]);

	if (data.liveStats) {
		return fillPlaceholders(html, data.liveStats);
	}
	return html;
};

/**
 * @function
 * @summary Fetches live statistics (if configured), generates the HTML content, and saves it to the file system.
 *
 * @param {Object} item - The individual data object (project or writeup) parsed from the JSON file.
 * @param {string} type - The category classification of the item (e.g., 'project', 'writeup').
 * @param {string} folder - The sub-directory name where the compiled HTML file will reside.
 * @param {string} destination - The absolute or relative path to the root output folder.
 *
 * @returns {Promise<void>}
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const processItem = async (item, type, folder, destination) => {
	try {
		if (item.externalData) {
			item.liveStats = await fetchStats(item.externalData);
		}

		const html = generateContent(item, type);
		saveToFile(html, path.join(destination, folder), item.id);
	}
	catch (fileError) {
		console.error(`Error processing ${type} ID '${item?.id}':`, fileError.message);
	}
};

/**
 * @function
 * @summary The primary execution pipeline. Iterates through all defined content types and processes each item sequentially to build the static site.
 *
 * @param {string} destination - The base directory path where the compiled static site should be generated.
 *
 * @returns {Promise<void>}
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
module.exports = async (destination) => {
	const pipelines = [
		{ type: 'project', getData: getAllProjects, folder: 'projects' },
		{ type: 'writeup', getData: getAllWriteups, folder: 'writeups' },
	];

	for (const { type, getData, folder } of pipelines) {
		try {
			const items = getData();
			await Promise.all(
				items.map(item => processItem(item, type, folder, destination)),
			);
		}
		catch (pipelineError) {
			console.error(`CRITICAL Error loading data for ${type} pipeline:`, pipelineError.message);
		}
	}
};
