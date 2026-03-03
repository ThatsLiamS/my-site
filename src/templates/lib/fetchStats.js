/**
 * @function
 * @summary Fetches the total number of stars for a specified GitHub repository.
 *
 * @param {string} repo - The repository identifier in "owner/repo" format.
 *
 * @returns {Promise<number>} The total star count, or 0 if the repository is not found or the API limit is reached.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const getGithubStars = async (repo) => {
	const res = await fetch(`https://api.github.com/repos/${repo}`);
	if (!res.ok) return 0;

	const data = await res.json();
	return data.stargazers_count;
};

/**
 * @function
 * @summary Calculates the total downloads for an NPM package since 2021 by aggregating data year-by-year to bypass API limitations.
 *
 * @param {string} packageName - The exact registry name of the NPM package.
 *
 * @returns {Promise<number>} The total aggregated downloads across the calculated timeframe.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const getNpmDownloads = async (packageName) => {
	const startYear = 2021;
	const currentYear = new Date().getFullYear();
	let grandTotal = 0;

	for (let year = startYear; year <= currentYear; year++) {
		const start = `${year}-01-01`;
		const end = year === currentYear
			? new Date().toISOString().split('T')[0]
			: `${year}-12-31`;

		const res = await fetch(`https://api.npmjs.org/downloads/point/${start}:${end}/${packageName}`);
		if (!res.ok) continue;

		const data = await res.json();
		grandTotal += data.downloads || 0;
	}
	return grandTotal;
};

/**
 * @function
 * @summary Concurrently fetches external statistics (NPM downloads, GitHub stars) based on the provided project configuration.
 *
 * @param {Object} externalData - An object detailing which external platforms to fetch data from.
 * @param {string} [externalData.npmPackage] - (Optional) The NPM package name.
 * @param {string} [externalData.githubRepo] - (Optional) The GitHub repo identifier.
 *
 * @returns {Promise<Object>} A dictionary object containing the mapped statistics (e.g., { 'npm-downloads': 26500 }).
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const fetchStats = async (externalData) => {
	const jsonData = {};

	const fetchPromises = [];
	const keys = [];

	if (externalData.npmPackage) {
		keys.push('npm-downloads');
		fetchPromises.push(getNpmDownloads(externalData.npmPackage));
	}
	if (externalData.githubRepo) {
		keys.push('github-stars');
		fetchPromises.push(getGithubStars(externalData.githubRepo));
	}
	const resultsArray = await Promise.all(fetchPromises);

	keys.forEach((key, index) => {
		jsonData[key] = resultsArray[index];
	});
	return jsonData;
};

/**
 * @function
 * @summary Parses a string template and replaces {{key}} placeholders with corresponding values from a data object.
 *
 * @param {string} templateString - The raw string or HTML containing the {{placeholders}}.
 * @param {Object} [dataObject={}] - The data object used for replacements. Supports nested dot-notation (e.g., 'stats.downloads').
 *
 * @returns {string} The fully formatted string with placeholders replaced, or empty strings where data was missing.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const fillPlaceholders = (templateString, dataObject = {}) => {
	return templateString.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
		const properties = key.trim().split('.');

		const value = properties.reduce((currentObject, currentProperty) => {
			if (currentObject && currentObject[currentProperty] !== undefined) {
				return currentObject[currentProperty];
			}
			return null;
		}, dataObject);

		if (value === null) return '';
		return typeof value === 'number' ? value.toLocaleString() : String(value);
	});
};

module.exports = {
	fetchStats,
	fillPlaceholders,
};
