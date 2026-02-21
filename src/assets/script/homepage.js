const textToType = 'Liam Skinner AIoL';

const typeWriterElement = document.getElementById('typewriter-text');
let index = 0;
const typingSpeed = 35;

const typeWriter = () => {
	if (index < textToType.length) {
		if (textToType.charAt(index) === '\n') {
			typeWriterElement.innerHTML += '<br>';
		}
		else {
			typeWriterElement.innerHTML += textToType.charAt(index);
		}
		index++;
		setTimeout(typeWriter, typingSpeed);
	}
};

window.onload = () => setTimeout(typeWriter, 500);
