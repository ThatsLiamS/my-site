document.addEventListener('DOMContentLoaded', () => {
	const navToggle = document.getElementById('nav-toggle');
	const navbar = document.querySelector('.navbar');

	document.addEventListener('click', (event) => {
		if (navToggle && navToggle.checked) {

			const clickedOutside = !navbar.contains(event.target);
			const clickedLink = event.target.tagName.toLowerCase() === 'a';

			if (clickedOutside || clickedLink) {
				navToggle.checked = false;
			}
		}
	});
});
