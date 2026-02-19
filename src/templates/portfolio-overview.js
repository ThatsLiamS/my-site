const fs = require('fs');
const path = require('path');

const globalContent = require('../content/global.json');

const { escapeHTML, saveToFile, ensureArray, joinHTML } = require('./lib/utils');
const { headTag, navTag, footerTag } = require('./lib/components');

/**
 * @function
 * @summary Reads and parses a JSON file from the filesystem.
 *
 * @param {string} filePath - The absolute path to the JSON file to read.
 * @returns {Object|null} The parsed JSON object, or null if reading/parsing fails.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const readJSONFile = (filePath) => {
	try {
		const raw = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(raw);
	}
	catch (err) {
		console.warn(`Warning: Could not read/parse file at ${filePath}`, err.message);
		return null;
	}
};

/**
 * @function
 * @summary Fetches, parses, filters, and sorts all valid writeup JSON files from the content directory.
 *
 * @returns {Array<Object>} An array of parsed writeup objects, sorted by date (newest first).
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const getWriteups = () => {
	const folderPath = path.resolve(__dirname, '../content/writeups/');

	try {
		const files = fs.readdirSync(folderPath);
		return files
			.filter(file =>
				path.extname(file).toLowerCase() === '.json' &&
				file !== 'template.json',
			)
			.map(file => readJSONFile(path.join(folderPath, file)))
			.filter(Boolean)
			.sort((a, b) => {
				const dateA = a.date || '';
				const dateB = b.date || '';
				return dateB.localeCompare(dateA);
			});
	}
	catch (error) {
		console.error('Error fetching writeups directory:', error.message);
		return [];
	}
};

/**
 * @function
 * @summary Standardizes a platform category string into a predictable slug.
 *
 * @param {string} category - The raw category string to evaluate (e.g., 'TryHackMe').
 * @returns {string} The normalized slug (e.g., 'thm', 'htb', 'sucss', 'other').
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const getPlatformSlug = (category) => {
	const c = (category || '').toLowerCase();
	if (c.includes('sucss')) return 'sucss';
	if (c.includes('thm') || c.includes('tryhackme')) return 'thm';
	if (c.includes('htb') || c.includes('hackthebox')) return 'htb';
	return 'other';
};

/**
 * @function
 * @summary Renders an array of tag strings into HTML pills, along with a hidden counter pill for UI expansion.
 *
 * @param {Array<string>} tags - The array of tag strings to render.
 * @returns {string} The concatenated HTML string of tag pills.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderTags = (tags) => {
	const safeTags = ensureArray(tags);

	const tagHTML = safeTags
		.map(tag => `<span class="tag-pill candidate">${escapeHTML(tag)}</span>`)
		.join('');

	const counterHTML = '<span class="tag-pill more-counter" style="display:none;"></span>';

	return tagHTML + counterHTML;
};

/**
 * @function
 * @summary Generates the HTML for a single writeup preview card within the portfolio grid.
 *
 * @param {Object} [writeup={}] - The specific writeup data object to display.
 * @returns {string} The formatted HTML string for the writeup card.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderWriteupCard = (writeup = {}) => {
	const tagsHTML = renderTags(writeup.tags);

	const dateObj = new Date(writeup.date);
	const formattedDate = dateObj.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});

	const diffRaw = (writeup.difficulty || 'Medium');
	const diffSlug = diffRaw.toLowerCase();

	const platformRaw = (writeup.platform || 'Other');
	const platformSlug = getPlatformSlug(platformRaw);

	const summary = writeup.summary
		? escapeHTML(writeup.summary)
		: 'Click to view the full writeup and solution details.';

	return `
	<a class="grid-card-link filter-item" href="/writeups/${writeup.id}.html" 
	data-platform="${platformSlug}" data-difficulty="${diffSlug}">
		<article class="grid-card difficulty-border-${diffSlug}">
			<div class="card-top">
				<span class="difficulty-badge ${diffSlug}">${escapeHTML(diffRaw)}</span>
				<span class="card-date">${escapeHTML(platformRaw)} • ${formattedDate}</span>
			</div>
			
			<h2 class="card-title">${escapeHTML(writeup.title)}</h2>
			
			<p class="card-excerpt">${summary}</p>

			<div class="card-footer">
				<div class="tag-container-compact smart-tags">${tagsHTML}</div>
			</div>
		</article>
	</a>`;
};

/**
 * @function
 * @summary Generates the HTML for the top header section of the portfolio page, including filter controls.
 *
 * @returns {string} The formatted HTML string for the header and filter toolbar.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderHeaderCard = () => {
	return `
	<div class="header-card">
		<h1>Technical Writeups</h1>
		
		<div class="filter-toolbar">
			<div class="filter-group">
				<div class="custom-select-wrapper" id="platform-select-wrapper">
					<div class="custom-select">
						<div class="custom-select-trigger">All Platforms</div>
						<div class="custom-options">
							<span class="custom-option selected" data-value="all">All Platforms</span>
							<span class="custom-option" data-value="sucss">SUCSS</span>
						</div>
					</div>
				</div>
			</div>

			<div class="filter-group">
				<div class="diff-toggles" role="group" aria-label="Filter by Difficulty">
					<button class="diff-btn active" data-value="all">All</button>
					<button class="diff-btn" data-value="easy">Easy</button>
					<button class="diff-btn" data-value="medium">Medium</button>
					<button class="diff-btn" data-value="hard">Hard</button>
				</div>
			</div>
		</div>
	</div>`;
};

/**
 * @function
 * @summary Renders the entire grid list of writeup cards.
 *
 * @param {Array<Object>} writeups - The array of parsed writeup data objects.
 * @returns {string} The formatted HTML string containing the grid of generated cards.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderWriteupsList = (writeups) => {
	const cardsHtml = ensureArray(writeups)
		.map(renderWriteupCard)
		.join('\n');

	return `<div class="writeups-grid">${cardsHtml}</div>`;
};

/**
 * @function
 * @summary Assembles the complete HTML layout for the portfolio overview page.
 *
 * @param {Array<Object>} writeups - The parsed array of writeup data used to populate the grid.
 * @returns {string} The fully formatted HTML document string.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const generateContent = (writeups) => {
	const headInfo = {
		title: `Portfolio | ${escapeHTML(globalContent.site.author)}`,
		author: globalContent.site.author,
		summary: 'Security Research and CTF Writeups',
		base_url: globalContent.site.base_url,
		style_name: 'portfolio-overview',
	};

	const navInfo = {
		left: ['/', 'Homepage'],
		centre: [],
	};

	return joinHTML([
		'<!DOCTYPE html>',
		'<html lang="en-GB">',
		headTag(headInfo),
		'<body>',
		navTag(navInfo),
		'<main class="container wide-container">',
		renderHeaderCard(),
		renderWriteupsList(writeups),
		'</main>',
		footerTag(),
		'<script src="/assets/script/portfolio.js"></script>',
		'</body>',
		'</html>',
	]);
};

/**
 * @function
 * @summary Retrieves writeup data, generates the portfolio HTML content, and saves it to a file.
 *
 * @param {string} destination - The directory path where 'portfolio.html' will be output.
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const buildPortfolioOverview = (destination) => {
	try {
		const writeups = getWriteups();
		const html = generateContent(writeups);

		saveToFile(html, destination, 'portfolio');
	}
	catch (error) {
		console.error('Error generating portfolio overview:', error.message);
	}
};

/**
 * @function
 * @summary The main execution pipeline for building the portfolio overview page.
 *
 * @param {string} destination - The target directory path for the build output.
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
module.exports = (destination) => {
	try {
		buildPortfolioOverview(destination);
	}
	catch (error) {
		console.error('CRITICAL Error within portfolio-overview.js pipeline:', error.message);
	}
};
