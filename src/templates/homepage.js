const path = require('path');

const globalContent = require('../content/global.json');

const { escapeHTML, ensureArray, joinHTML } = require('./lib/utils');
const { saveToFile } = require('./lib/fileUtils');
const { renderContentBlock } = require('./lib/blockParser');
const { headTag, navTag, footerTag } = require('./lib/components');

/**
 * @function
 * @summary Generates the HTML for the profile header and the 'About Me' section.
 *
 * @returns {string} The formatted HTML string for the introductory sections.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderIntro = (biography) => {
	const shortName = globalContent.site.author.shortName;

	const htmlBio = (biography || [])
		.map(e => escapeHTML(e))
		.join('</p> <p class="output">');

	return `
	<header id="about" class="terminal-window">
		<div class="terminal-header">
			<span class="dot close"></span>
			<span class="dot minimize"></span>
			<span class="dot maximize"></span>
		</div>
		<div class="terminal-body">
			<p><span class="prompt">(${shortName}㉿home)-[~] $</span> whoami</p>
			<p class="output" id="typewriter-text" data-texts='["${globalContent.site.author.fullName}"]'></p>
			
			<p><span class="prompt">(${shortName}㉿home)-[~] $</span> cat bio.txt</p>
			<p class="output">
				${htmlBio}
			</p>
			
			<p><span class="prompt">(${shortName}㉿home)-[~] $</span> <span class="cursor">_</span></p>
		</div>
	</header>
`;
};

/**
 * @function
 * @summary Generates the HTML for the qualifications section, rendering each as a stylized tag.
 *
 * @param {Array<string>} qualifications - An array of qualification strings.
 * @returns {string} The formatted HTML string for the qualifications section.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderQualifications = (qualifications) => `
	<section id="qualifications" class="card">
		<h2>Qualifications</h2>
		<div class="tag-container">
			${ensureArray(qualifications)
		.map(text => `<div class="tag">${escapeHTML(text)}</div>`)
		.join('')}
		</div>
	</section>
`;

/**
 * @function
 * @summary Generates the HTML layout for an individual timeline item (e.g., a job role or degree).
 *
 * @param {Object} [item={}] - Timeline details. Expects title, company, time_period, logo, and a description.
 * @returns {string} The formatted HTML string for a single timeline item.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderTimelineItem = (item = {}) => {
	const descriptionHTML = item.description.map(desc => {
		return renderContentBlock(desc);
	}).join('\n');

	return `
	<div class="timeline-item">
		<img src="${item.logo}" alt="Logo" class="item-logo">

		<div class="item-details">
			<h3>${escapeHTML(item.title)}</h3>

			<span class="subtitle">
				${escapeHTML(item.company)}
				• ${escapeHTML(item.time_period)}
			</span>

			${descriptionHTML}
		</div>
	</div>
`;
};

/**
 * @function
 * @summary Assembles a complete timeline section by mapping a data array to timeline items.
 *
 * @param {Object} config - An object containing the section's 'id', 'title', and 'data' array.
 * @returns {string} The formatted HTML string for the given timeline section.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderTimelineSection = ({ id, title, data }) => `
	<section id="${id}" class="card">
		<h2>${title}</h2>
		${ensureArray(data).map(renderTimelineItem).join('')}
	</section>
`;

/**
 * @function
 * @summary Orchestrates the generation of the entire HTML page structure and injects the parsed data.
 *
 * @param {Object} dynamic - The dynamic JSON data populating the page. Expected to contain: summary, biography, qualifications, experience, education, and awards.
 * @returns {string} The complete, concatenated HTML string for the homepage.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const generateContent = (dynamic) => {
	const headInfo = {
		title: `${escapeHTML(globalContent.site.author.fullName)} | Offensive Security Specialist`,
		author: globalContent.site.author.fullName,
		summary: dynamic.summary,
		base_url: globalContent.site.base_url,
		stylesheets: ['homepage'],
		javascripts: ['navbar', 'homepage'],
	};

	const navInfo = {
		left: ['../portfolio', './Portfolio'],
		right: [
			['#about', '#About'],
			['#experience', '#Experience'],
			['#education', '#Education'],
			['#awards', '#Awards'],
		],
	};

	const timelineConfig = [
		{ id: 'experience', title: 'Experience', data: dynamic.experience },
		{ id: 'education', title: 'Education', data: dynamic.education },
		{ id: 'awards', title: 'Awards', data: dynamic.awards },
	];

	const timelineHTML = timelineConfig
		.map(renderTimelineSection)
		.join('\n');

	return joinHTML([
		'<!DOCTYPE html>',
		'<html lang="en-GB">',
		headTag(headInfo),
		'<body>',
		navTag(navInfo),
		'<main class="container">',
		renderIntro(dynamic.biography),
		renderQualifications(dynamic.qualifications),
		timelineHTML,
		'</main>',
		footerTag(),
		'</body>',
		'</html>',
	]);
};

/**
 * @function
 * @summary Loads the `index.json` data and builds the HTML file.
 *
 * @param {string} destination - The target directory path where the generated 'index.html' file will be saved.
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const buildIndexPage = (destination) => {
	try {
		const dataPath = path.resolve(__dirname, '../content/index.json');
		const jsonData = require(dataPath);

		const html = generateContent(jsonData);
		saveToFile(html, destination, 'index');
	}
	catch (err) {
		console.error('Error loading index.json or building page:', err.message);
	}
};

/**
 * @function
 * @summary The main execution pipeline for building the homepage.
 *
 * @param {string} destination - The target directory path for the build output.
 * @returns {void} This function does not return a value.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
module.exports = (destination) => {
	try {
		buildIndexPage(destination);
	}
	catch (error) {
		console.error('CRITICAL Error within homepage.js pipeline:', error.message);
	}
};
