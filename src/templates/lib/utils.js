const fs = require('fs');
const fsPromise = require('fs/promises');
const path = require('path');

/**
 * @function
 * @summary Escapes special characters in a string to prevent HTML injection.
 *
 * @param {string|number} str - The input string or number to be escaped.
 * @returns {string} The sanitized string with HTML entities replaced.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const escapeHTML = (str) => {
	if (!str && str !== 0) return '';
	return String(str).replace(/[&<>"']/g, (m) => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#39;',
	})[m]);
};

/**
 * @function
 * @summary Ensures that the provided value is an array.
 *
 * @param {*} value - The value to evaluate.
 * @returns {Array} The original array, or a new empty array if the value is not an array.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const ensureArray = (value) => {
	return Array.isArray(value) ? value : [];
};

/**
 * @function
 * @summary Filters out falsy values from an array and joins the remaining items with a newline.
 *
 * @param {Array<string>} arr - The array of HTML strings to join.
 * @returns {string} The resulting multi-line HTML string.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const joinHTML = (arr) => {
	return arr.filter(Boolean).join('\n');
};

/**
 * @function
 * @summary Recursively creates the destination directory if needed and writes content to an HTML file.
 *
 * @param {string} content - The HTML string content to write to the file.
 * @param {string} destination - The target directory path.
 * @param {string} filename - The name of the file (excluding the .html extension).
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const saveToFile = (content, destination, filename) => {
	try {
		fs.mkdirSync(destination, { recursive: true });
		const filePath = path.join(destination, `${filename}.html`);
		fs.writeFileSync(filePath, content, 'utf8');
	}
	catch (error) {
		console.error(`Error writing file ${filename}:`, error.message);
	}
};

/**
 * @function @async
 * @summary Cleans the public build directory and copies static assets into it.
 *
 * @returns {Promise<void>} Promise - Resolves when the build directory is recreated and assets are copied.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const resetAssets = async () => {
	try {

		const BUILD_DIR = path.resolve(__dirname, './../../../public');
		const ASSETS_DIR = path.resolve(__dirname, './../../assets');

		await fsPromise.rm(BUILD_DIR, { recursive: true, force: true });
		await fsPromise.mkdir(BUILD_DIR, { recursive: true });

		const destDir = path.join(BUILD_DIR, 'assets');
		await fsPromise.cp(ASSETS_DIR, destDir, { recursive: true });
	}
	catch (error) {
		console.error('Error within utils.js:', error);
		process.exit(1);
	}
};

module.exports = {
	escapeHTML,
	saveToFile,
	ensureArray,
	joinHTML,
	resetAssets,
};
