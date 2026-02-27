const { escapeHTML, ensureArray } = require('./utils');

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
	const safeText = escapeHTML(text);

	return safeText
		.replace(/`([^`]+)`/g, '<code class="bold">$1</code>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong class="bold">$1</strong>');
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

module.exports = {
	parseInline,
	renderContentBlock,
};
