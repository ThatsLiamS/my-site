const path = require('path');

const globalContent = require('../content/global.json');

const { escapeHTML, ensureArray, joinHTML } = require('./lib/utils');
const { saveToFile } = require('./lib/fileUtils');
const { headTag, navTag, footerTag } = require('./lib/components');

/**
 * @function
 * @summary Generates the HTML for the profile header and the 'About Me' section.
 *
 * @param {Object} biography - An object containing arrays of biographical text for 'outdoor' and 'cyber' categories.
 * @returns {string} The formatted HTML string for the introductory sections.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderIntro = (biography) => {
	const rawbioOutdoor = biography?.outdoor || [];
	const rawbioCyber = biography?.cyber || [];

	const bioOutdoor = rawbioOutdoor.map(e => escapeHTML(e));
	const bioCyber = rawbioCyber.map(e => escapeHTML(e));

	return `
	<header class="card profile-header">
		<div class="profile-img"></div>

		<h1>${escapeHTML(globalContent.site.author)}</h1>

		<div class="career-toggle-wrapper">
			<div class="toggle-container">
				<button class="toggle-btn" data-target="cyber">Cyber</button>
				<button class="toggle-btn active" data-target="outdoor">Outdoor</button>
			</div>
		</div>
	</header>
	<section id="about" class="card">
		<h2>About Me</h2>
		
		<div class="dynamic-content" data-category="outdoor" class="bio-container">
			<p>
				${bioOutdoor.join('</p><p>')}
			</p>
		</div>
		<div class="dynamic-content" data-category="cyber" class="bio-container">
			<p>
				${bioCyber.join('</p><p>')}
			</p>
		</div>
	</section>
`;
};

/**
 * @function
 * @summary Generates the HTML for the qualifications section, rendering each as a stylized tag.
 *
 * @param {Array<string|Object>} qualifications - An array of qualification strings or objects containing specific text and categories.
 * @returns {string} The formatted HTML string for the qualifications section.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderQualifications = (qualifications) => `
	<section id="qualifications" class="card">
		<h2>Qualifications</h2>
		<div class="tag-container">
			${ensureArray(qualifications)
		.map(q => {
			const text = typeof q === 'string' ? q : q.text;
			const cat = (typeof q === 'object' && q.category) ? q.category : 'both';
			return `<div class="tag dynamic-content" data-category="${cat}">${escapeHTML(text)}</div>`;
		})
		.join('')}
		</div>
	</section>
`;

/**
 * @function
 * @summary Generates the HTML layout for an individual timeline item (e.g., a job role or degree).
 *
 * @param {Object} [item={}] - Timeline details. Expects title, company, time_period, logo, an optional root category, and a description (which can be a string or an array of {text, category} objects).
 * @returns {string} The formatted HTML string for a single timeline item.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const renderTimelineItem = (item = {}) => {
	const containerCategory = item.category || 'both';
	let descriptionHTML = '';

	if (Array.isArray(item.description)) {
		descriptionHTML = item.description.map(desc => {
			if (!desc.text) return '';
			return `<p class="dynamic-content" data-category="${desc.category}">${escapeHTML(desc.text)}</p>`;
		}).join('');
	}
	else if (typeof item.description === 'string') {
		descriptionHTML = `<p>${escapeHTML(item.description)}</p>`;
	}

	return `
	<div class="timeline-item dynamic-content" data-category="${containerCategory}">
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
		title: `${escapeHTML(globalContent.site.author)}`,
		author: globalContent.site.author,
		summary: dynamic.summary,
		base_url: globalContent.site.base_url,
		style_name: 'homepage',
	};

	const navInfo = {
		left: ['../portfolio', 'Portfolio'],
		centre: [
			['#about', 'About'],
			['#experience', 'Experience'],
			['#education', 'Education'],
			['#awards', 'Awards'],
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
		'<div class="container">',
		renderIntro(dynamic.biography),
		renderQualifications(dynamic.qualifications),
		timelineHTML,
		footerTag(),
		'</div>',
		'<script src="/assets/script/homepage.js"></script>',
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
