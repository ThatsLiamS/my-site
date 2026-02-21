const fs = require('fs/promises');
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

		await fs.rm(BUILD_DIR, { recursive: true, force: true });
		await fs.mkdir(BUILD_DIR, { recursive: true });

		const destDir = path.join(BUILD_DIR, 'assets');
		await fs.cp(ASSETS_DIR, destDir, { recursive: true });
	}
	catch (error) {
		console.error('Error within utils.js:', error);
		process.exit(1);
	}
};

/**
 * @function
 * @summary Parses and formats a date string into a localized British English (en-GB) date string.
 *
 * @param {string} dateString - A valid date string that can be parsed by the JavaScript Date constructor.
 * @param {string} [formatType='short'] - Determines the verbosity of the output. 'short' omits the weekday, while any other value includes it.
 * @returns {string} The formatted date string based on the specified format type.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const formatDate = (dateString, formatType = 'short') => {
	const dateObj = new Date(dateString);
	const options = formatType === 'short'
		? { day: 'numeric', month: 'short', year: 'numeric' }
		: { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };

	return dateObj.toLocaleDateString('en-GB', options);
};

/**
 * @function
 * @summary Converts a string to Title Case, capitalizing the first letter of each word.
 *
 * @param {string} str - The string to be transformed.
 * @returns {string} The transformed string with each word starting with an uppercase letter.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const toTitleCase = (str) => {
	return str.replace(
		/\w\S*/g,
		text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
	);
};

module.exports = {
	escapeHTML,
	ensureArray,
	joinHTML,
	resetAssets,
	formatDate,
	toTitleCase,
};
