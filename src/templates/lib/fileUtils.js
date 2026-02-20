const fs = require('fs');
const path = require('path');

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
 * @function
 * @summary Reads and parses a JSON file from the filesystem.
 *
 * @param {string} filePath - The absolute or relative path to the JSON file to read.
 * @returns {Object|Array|null} The parsed JSON data, or null if reading or parsing fails.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const readJSON = (filePath) => {
	try {
		const raw = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(raw);
	}
	catch (err) {
		console.warn(`Could not read/parse ${filePath}`, err.message);
		return null;
	}
};

/**
 * @function
 * @summary Retrieves and parses all valid JSON writeup files from the content directory, excluding the template.
 *
 * @returns {Array<Object>} An array containing the parsed data of all valid writeups.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const getAllWriteups = () => {
	const folderPath = path.resolve(__dirname, '../../content/writeups/');
	return fs.readdirSync(folderPath)
		.filter(file => file.endsWith('.json') && file !== 'template.json')
		.map(file => readJSON(path.join(folderPath, file)))
		.filter(Boolean);
};

module.exports = {
	saveToFile,
	readJSON,
	getAllWriteups,
};
