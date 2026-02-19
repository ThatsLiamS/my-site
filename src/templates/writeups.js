const fs = require('fs');
const path = require('path');

const globalContent = require('../content/global.json');

const { escapeHTML, saveToFile, ensureArray, joinHTML } = require('./lib/utils');
const { headTag, navTag, footerTag } = require('./lib/components');

/**
 * @function
 * @summary Escapes HTML characters and parses inline markdown-style backticks into code tags.
 *
 * @param {string} [text=''] - The raw string text to be parsed.
 * @returns {string} The sanitized HTML string with inline code formatting.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const parseInline = (text = '') => {
	const escaped = escapeHTML(text);
	return escaped.replace(/`(.*?)`/g, '<code class="bold">$1</code>');
};

/**
 * @constant {Object}
 * @summary A dictionary of rendering functions mapped to specific content block types.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const blockRenderers = {

	heading: ({ level = 3, id = '', content = '' }) => {
		return `<h${level} id="${id}">${escapeHTML(content)}</h${level}>`;
	},

	text: ({ content }) => {
		return ensureArray(content)
			.map(t => `<p>${parseInline(t)}</p>`)
			.join('\n');
	},

	blockquote: ({ bold = '', text }) => {
		const boldHTML = bold
			? `<strong>${parseInline(bold)}</strong> `
			: '';
		return `<blockquote>${boldHTML}${parseInline(text)}</blockquote>`;
	},

	codeblock: ({ language = 'none', content }) => {
		const code = ensureArray(content)
			.map(line => escapeHTML(line))
			.join('\n');
		return `<pre><code class="language-${language}">${code}</code></pre>`;
	},

	table: ({ content }) => {
		const rows = ensureArray(content);
		if (!rows.length) return '';

		const header = rows[0]
			.map(cell => `<th>${parseInline(cell)}</th>`)
			.join('');

		const body = rows.slice(1).map(row => {
			const cells = row.map((cell, i) => {
				const value = i === 0
					? `<code class="bold">${escapeHTML(cell)}</code>`
					: parseInline(cell);
				return `<td>${value}</td>`;
			}).join('');
			return `<tr>${cells}</tr>`;
		}).join('\n');

		return `
			<div class="table-container">
				<table>
					<thead><tr>${header}</tr></thead>
					<tbody>${body}</tbody>
				</table>
			</div>
		`;
	},

	list: ({ ordered = false, content }) => {
		const tag = ordered ? 'ol' : 'ul';
		const items = ensureArray(content)
			.map(item => `<li>${parseInline(item)}</li>`)
			.join('\n');
		return `<${tag}>${items}</${tag}>`;
	},
};

/**
 * @function
 * @summary Routes a specific data block to its corresponding HTML renderer.
 *
 * @param {Object} [block={}] - The content block object containing 'type' and 'content' properties.
 * @returns {string} The generated HTML string for the content block.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderContentBlock = (block = {}) => {
	const renderer = blockRenderers[block.type];
	return renderer ? renderer(block) : '';
};

/**
 * @function
 * @summary Generates the writeup header containing metadata such as title, date, and difficulty.
 *
 * @param {Object} dynamic - The JSON data representing the writeup's details.
 * @returns {string} The formatted HTML string for the header element.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const introTag = (dynamic) => {
	const tagsHTML = ensureArray(dynamic.tags)
		.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`)
		.join('');

	const dateObj = new Date(dynamic.date);
	const formattedDate = dateObj.toLocaleDateString('en-GB', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});

	const diffSlug = (dynamic.difficulty || 'medium').toLowerCase();

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
					${escapeHTML(dynamic.difficulty)}
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
 * @param {Object} dynamic - The JSON data representing the writeup, containing a 'cards' array.
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
 * @param {Object} dynamic - The parsed JSON data object representing a writeup.
 * @returns {string} The final, fully formatted HTML document string.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const generateContent = (dynamic) => {
	const headInfo = {
		title: `Writeup: ${escapeHTML(dynamic.title)} | ${escapeHTML(globalContent.site.author)}`,
		author: globalContent.site.author,
		summary: dynamic.summary,
		base_url: globalContent.site.base_url,
		style_name: 'writeups',
	};

	const navInfo = {
		left: ['/portfolio', 'Portfolio'],
		centre: dynamic.nav,
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
 * @summary Reads a writeup JSON file, parses its data, generates HTML, and saves it to the build folder.
 *
 * @param {string} filePath - The absolute file path to the source JSON file.
 * @param {string} destination - The target directory for the build output.
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const processWriteupFile = (filePath, destination) => {
	try {
		const raw = fs.readFileSync(filePath, 'utf8');
		const json = JSON.parse(raw);
		const html = generateContent(json);

		saveToFile(
			html,
			path.join(destination, 'writeups/'),
			json.id,
		);
	}
	catch (err) {
		console.error(`Error processing file ${filePath}:`, err.message);
	}
};

/**
 * @function
 * @summary The main execution pipeline that loops through all JSON files in the writeups content folder.
 *
 * @param {string} destination - The target directory path for the final HTML outputs.
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
module.exports = (destination) => {
	const folderPath = path.resolve(__dirname, '../content/writeups/');

	try {
		const files = fs.readdirSync(folderPath);

		files
			.filter(file =>
				path.extname(file).toLowerCase() === '.json' &&
				file !== 'template.json',
			)
			.forEach(file => {
				const fullPath = path.join(folderPath, file);
				processWriteupFile(fullPath, destination);
			});

	}
	catch (error) {
		console.error('CRITICAL Error within writeups.js pipeline:', error.message);
	}
};
