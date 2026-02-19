document.addEventListener('DOMContentLoaded', () => {
	const buttons = document.querySelectorAll('.toggle-btn');

	/**
	 * @function
	 * @summary Updates the UI to reflect the selected mode by toggling button active states and showing/hiding dynamic content elements.
	 *
	 * @param {string} mode - The target mode/category to display (e.g., 'cyber' or 'outdoor').
	 * @returns {void} This function does not return a value.
	 *
	 * @author Liam Skinner <me@liamskinner.co.uk>
	 */
	const setMode = (mode) => {
		buttons.forEach(btn => {
			if (btn.dataset.target === mode) {
				btn.classList.add('active');
			}
			else {
				btn.classList.remove('active');
			}
		});

		const contentItems = document.querySelectorAll('.dynamic-content');
		contentItems.forEach(el => {
			const category = el.getAttribute('data-category');

			if (category === 'both' || category === mode) {
				el.classList.remove('hidden');
				el.style.display = '';
			}
			else {
				el.classList.add('hidden');
				el.style.display = 'none';
			}
		});
	};

	buttons.forEach(btn => {
		btn.addEventListener('click', () => setMode(btn.dataset.target));
	});

	setMode('cyber');
});
