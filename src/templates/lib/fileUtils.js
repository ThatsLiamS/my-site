const fs = require('fs');
const path = require('path');

const globalContent = require('./../../content/global.json');

/**
 * @function
 * @summary Recursively creates the destination directory if needed and writes content to an HTML file.
 *
 * @param {string} content - The HTML string content to write to the file.
 * @param {string} destination - The target directory path.
 * @param {string} filename - The name of the file (excluding the .html extension).
 * @param {boolean} [extension=true] - The flag to determine auto html appendage
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const saveToFile = (content, destination, filename, extension = true) => {
	try {
		const fileExtension = extension ? '.html' : '';

		fs.mkdirSync(destination, { recursive: true });
		const filePath = path.join(destination, `${filename}${fileExtension}`);
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
 * @summary Generates and saves an XML sitemap for the website.
 *
 * @param {string} destination - The target directory path where the `sitemap.xml` file should be saved.
 * @returns {void} This function does not return a value; it writes directly to a file.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const createSitemap = (destination) => {
	const baseUrl = globalContent.site.base_url;

	const today = new Date();
	const formattedDate = today.toISOString().split('T')[0];
	const domainXML = [
		'    <url>',
		`        <loc>${baseUrl}/</loc>`,
		`        <lastmod>${formattedDate}</lastmod>`,
		'        <priority>1.0</priority>',
		'    </url>',
	].join('\n');

	const allWriteups = getAllWriteups()
		.sort((a, b) => {
			const dateA = a.date || '';
			const dateB = b.date || '';
			return dateB.localeCompare(dateA);
		});;

	const portfolioXML = [
		'    <url>',
		`        <loc>${baseUrl}/portfolio</loc>`,
		`        <lastmod>${allWriteups[0].date}</lastmod>`,
		'        <priority>0.8</priority>',
		'    </url>',
	].join('\n');

	const writeupsXML = [];
	for (const writeup of allWriteups) {
		writeupsXML.push([
			'    <url>',
			`        <loc>${baseUrl}/writeups/${writeup.id}</loc>`,
			`        <lastmod>${writeup.date}</lastmod>`,
			'        <priority>0.6</priority>',
			'    </url>',
		].join('\n'));
	}

	const xmlFile = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		domainXML,
		portfolioXML,
		writeupsXML.join('\n'),
		'</urlset>',
	].join('\n');

	saveToFile(xmlFile, destination, 'sitemap.xml', false);
};

/**
 * @function
 * @summary Generates and saves an TXT robots for the website.
 *
 * @param {string} destination - The target directory path where the `robots.txt` file should be saved.
 * @returns {void} This function does not return a value; it writes directly to a file.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const createRobots = (destination) => {
	const userAgent = [
		'User-agent: *',
		'Content-Signal: search=yes, ai-input=no, ai-train=no',
	].join('\n');

	const pathways = [
		'Allow: /$',
		'Allow: /portfolio$',
		'Allow: /writeups/',
		'Allow: /assets/',
		'Disallow: /',
	].join('\n');

	const sitemap = `Sitemap: ${globalContent.site.base_url}/sitemap.xml`;

	const robotsTxt = [
		globalContent.robots.join('\n'),
		'',
		userAgent,
		'',
		pathways,
		'',
		sitemap,
	].join('\n');

	saveToFile(robotsTxt, destination, 'robots.txt', false);
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
	createSitemap,
	createRobots,
};
