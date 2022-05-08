'use-strict';

const nav = this.document.querySelector('.nav');
const lines = this.document.querySelector('.toggle-btn');

this.document.querySelector('.toggle-btn').addEventListener('click', (event) => {
	nav.classList.contains('show-nav') ? nav.classList.remove('show-nav') : nav.classList.add('show-nav');
	event.stopPropagation();

	lines.classList.contains('toggle-close') ? lines.classList.remove('toggle-close') : lines.classList.add('toggle-close');
});

this.document.addEventListener('click', () => {
	nav.classList.contains('show-nav') && nav.classList.remove('show-nav');
	lines.classList.contains('toggle-close') && lines.classList.remove('toggle-close');
});

const linesPosition = this.document.querySelector('.toggle-btn').getBoundingClientRect().top + this.window.scrollY;
this.window.addEventListener('scroll', () => {
	const WindowPosition = this.document.querySelector('html').scrollTop;

	WindowPosition >= linesPosition ?
		(lines.classList.add('fixed'), nav.classList.add('stickyNav')) :
		(lines.classList.remove('fixed'), nav.classList.remove('stickyNav'));

});
