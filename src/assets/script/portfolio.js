document.addEventListener('DOMContentLoaded', () => {

	const cards = document.querySelectorAll('.filter-item');

	const customSelect = document.querySelector('.custom-select');
	const customSelectTrigger = document.querySelector('.custom-select-trigger');
	const customOptions = document.querySelectorAll('.custom-option');

	const diffButtons = document.querySelectorAll('.diff-btn');

	const state = { platform: 'all', difficulty: 'all' };

	/**
	 * @function
	 * @summary Evaluates the current filter state and updates the visibility of portfolio cards accordingly. Displays an empty state message if no cards match.
	 *
	 * @returns {void} This function does not return a value.
	 *
	 * @author Liam Skinner <me@liamskinner.co.uk>
	 */
	const applyFilters = () => {
		let visibleCount = 0;
		const emptyStateMessage = document.getElementById('no-writeups-message');

		cards.forEach(card => {
			const cardPlatform = card.getAttribute('data-platform');
			const cardDiff = card.getAttribute('data-difficulty');

			const matchPlatform = (state.platform === 'all') || (state.platform === cardPlatform);
			const matchDiff = (state.difficulty === 'all') || (state.difficulty === cardDiff);

			if (matchPlatform && matchDiff) {
				card.style.display = '';
				visibleCount++;
			}
			else {
				card.style.display = 'none';
			}
		});

		if (emptyStateMessage) {
			if (visibleCount === 0) {
				emptyStateMessage.style.display = 'flex';
			}
			else {
				emptyStateMessage.style.display = 'none';
			}
		}

		requestAnimationFrame(adjustTags);
	};

	if (customSelect) {
		customSelectTrigger.addEventListener('click', () => {
			customSelect.classList.toggle('open');
		});

		customOptions.forEach(option => {
			option.addEventListener('click', () => {
				customOptions.forEach(opt => opt.classList.remove('selected'));
				option.classList.add('selected');

				customSelectTrigger.textContent = option.textContent;

				state.platform = option.getAttribute('data-value');

				applyFilters();
				customSelect.classList.remove('open');
			});
		});

		window.addEventListener('click', (e) => {
			if (!customSelect.contains(e.target)) {
				customSelect.classList.remove('open');
			}
		});
	}

	diffButtons.forEach(btn => {
		btn.addEventListener('click', (e) => {
			diffButtons.forEach(b => b.classList.remove('active'));
			e.target.classList.add('active');
			state.difficulty = e.target.getAttribute('data-value');
			applyFilters();
		});
	});

	/**
	 * @function
	 * @summary Calculates the available width for tag containers and visually truncates overflowing tags, displaying a numeric counter for hidden items.
	 *
	 * @returns {void} This function does not return a value.
	 *
	 * @author Liam Skinner <me@liamskinner.co.uk>
	*/
	const adjustTags = () => {
		const containers = document.querySelectorAll('.smart-tags');

		containers.forEach(container => {
			if (!container.offsetWidth) return;

			const tags = Array.from(container.querySelectorAll('.candidate'));
			const counter = container.querySelector('.more-counter');

			tags.forEach(t => t.style.display = 'inline-block');
			counter.style.display = 'none';

			const containerWidth = container.offsetWidth;
			const gap = 8;
			const estimatedCounterWidth = 45;

			let currentLineWidth = 0;
			let hiddenCount = 0;

			tags.forEach((tag) => {
				const tagWidth = tag.getBoundingClientRect().width + gap;

				if (currentLineWidth + tagWidth > (containerWidth - estimatedCounterWidth)) {
					tag.style.display = 'none';
					hiddenCount++;
				}
				else {
					currentLineWidth += tagWidth;
				}
			});

			if (hiddenCount > 0) {
				counter.innerText = `+${hiddenCount}`;
				counter.style.display = 'inline-block';
			}
		});
	};

	window.addEventListener('load', () => {
		setTimeout(adjustTags, 50);
	});

	window.addEventListener('resize', adjustTags);
});
