const fs = require('fs');

const { globSync } = require('glob');
const { minify: minifyJS } = require('terser');
const CleanCSS = require('clean-css');
const { minify: minifyHTML } = require('html-minifier-terser');

const { createSitemap, createRobots } = require('./templates/lib/fileUtils.js');

/**
 * @function @async
 * @summary Minifies all JavaScript, CSS, and HTML files within the public build directory.
 *
 * @returns {Promise<void>} Promise - Resolves when all files have been successfully minified.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
const minifyCode = async () => {

	/* Minify JavaScript Files */
	const jsFiles = globSync('public/assets/script/**/*.js');
	for (const file of jsFiles) {
		const code = fs.readFileSync(file, 'utf8');
		const result = await minifyJS(code, {
			compress: {
				dead_code: true,
				drop_console: true,
				drop_debugger: true,
			},
			mangle: {
				toplevel: true,
			},
			format: {
				comments: false,
			},
		});
		if (result.code) {
			fs.writeFileSync(file, result.code);
		}
	}

	/* Minify CSS Files */
	const cssFiles = globSync('public/assets/style/**/*.css');
	const cleaner = new CleanCSS();
	for (const file of cssFiles) {
		const code = fs.readFileSync(file, 'utf8');
		const output = cleaner.minify(code);
		fs.writeFileSync(file, output.styles);
	}

	/* Minify HTML Files */
	const htmlFiles = globSync('public/**/*.html');
	for (const file of htmlFiles) {
		const code = fs.readFileSync(file, 'utf8');
		const minified = await minifyHTML(code, {
			collapseWhitespace: true,
			removeComments: true,
			removeAttributeQuotes: true,
			minifyJS: true,
			minifyCSS: true,
		});
		fs.writeFileSync(file, minified);
	}
};

/**
 * @function @async
 * @summary The main execution pipeline that runs all template build scripts and then minifies the output.
 *
 * @returns {Promise<void>} Promise - Resolves when the entire build and minification process completes.
 *
 * @author Liam Skinner <me@liamskinner.co.uk>
 */
(async () => {
	console.time('Build Time');

	await require('./templates/lib/utils.js').resetAssets();
	[
		{ name: 'Homepage', handler: require('./templates/homepage.js') },
		{ name: 'Not Found Page', handler: require('./templates/not-found.js') },
		{ name: 'Portfolio Overview', handler: require('./templates/portfolio-overview.js') },
		{ name: 'Writeups', handler: require('./templates/writeups.js') },
	]
		.forEach(task => {
			try {
				console.log(`Building: ${task.name}`);
				task.handler('./public/');
			}
			catch (error) {
				console.error(
					`Build failure in ${task.name}:`,
					error.message,
				);
			}
		});
	await createSitemap('./public/');
	await createRobots('./public/');

	console.timeEnd('Build Time');
	console.time('Minify Time');

	await minifyCode();

	console.timeEnd('Minify Time');
})();
