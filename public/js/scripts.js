'use-strict'

const nav = document.querySelector('.nav');
const lines = document.querySelector('.toggle-btn');

document.querySelector('.toggle-btn').addEventListener('click', (event) => {
	nav.classList.contains('show-nav') ? nav.classList.remove('show-nav') : nav.classList.add('show-nav');
	event.stopPropagation();

	lines.classList.contains('toggle-close') ? lines.classList.remove('toggle-close') : lines.classList.add('toggle-close');
});

document.addEventListener('click', () => {
	nav.classList.contains('show-nav') && nav.classList.remove('show-nav');
	lines.classList.contains('toggle-close')  && lines.classList.remove('toggle-close');
});

const linesPosition = document.querySelector('.toggle-btn').getBoundingClientRect().top + window.scrollY;
window.addEventListener('scroll', () => {
	const WindowPosition = document.querySelector('html').scrollTop;

	WindowPosition >= linesPosition ?
		(lines.classList.add('fixed'), nav.classList.add('stickyNav')) :
		(lines.classList.remove('fixed'), nav.classList.remove('stickyNav'));

});
