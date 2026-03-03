const fs = require('fs');
const path = require('path');

const { globSync } = require('glob');
const { minify: minifyJS } = require('terser');
const CleanCSS = require('clean-css');
const { minify: minifyHTML } = require('html-minifier-terser');

const { createSitemap, createRobots } = require('./templates/lib/fileUtils.js');
const { resetAssets } = require('./templates/lib/utils.js');

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
	try {
		console.time('Total Time');
		console.time('Build Time');

		await resetAssets();
		await createSitemap('./public/');
		await createRobots('./public/');

		const templatesDir = path.join(__dirname, 'templates');
		const templateFiles = fs
			.readdirSync(templatesDir)
			.filter(file => file.endsWith('.js'));

		for (const file of templateFiles) {
			try {
				const handler = require(path.join(templatesDir, file));
				await handler('./public/');
			}
			catch (error) {
				console.error(`Build failure in ${file}:`, error.message);
			}
		}

		console.timeEnd('Build Time');

		console.time('Minify Time');
		await minifyCode();
		console.timeEnd('Minify Time');

		console.timeEnd('Total Time');
	}
	catch (fatalError) {
		console.error('\nFatal Build Error:', fatalError.message);
		process.exit(1);
	}
})();
