const path = require('path');
const globalContent = require('../content/global.json');

const {
	escapeHTML,
	ensureArray,
	joinHTML,
	toTitleCase,
	mapStatusToDifficulty,
	formatDate,
} = require('./lib/utils');

const { saveToFile, getAllProjects, getAllWriteups } = require('./lib/fileUtils');
const { renderContentBlock } = require('./lib/blockParser');
const { headTag, navTag, footerTag } = require('./lib/components');

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

	return joinHTML([
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
};

/**
 * @function
 * @summary The main execution pipeline that loops through all JSON files to generate individual HTML pages.
 *
 * @param {string} destination - The base target directory path.
 *
 * @returns {void}
 */
module.exports = (destination) => {
	const pipelines = [
		{ type: 'project', getData: getAllProjects, folder: 'projects' },
		{ type: 'writeup', getData: getAllWriteups, folder: 'writeups' },
	];

	pipelines.forEach(({ type, getData, folder }) => {
		try {
			const items = getData();

			items.forEach(item => {
				try {
					const html = generateContent(item, type);
					saveToFile(html, path.join(destination, folder), item.id);
				}
				catch (fileError) {
					console.error(`Error processing ${type} ID '${item.id}':`, fileError.message);
				}
			});
		}
		catch (pipelineError) {
			console.error(`CRITICAL Error loading data for ${type} pipeline:`, pipelineError.message);
		}
	});
};
