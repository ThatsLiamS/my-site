const typingSpeed = 35;

document.addEventListener('DOMContentLoaded', () => {
	const typeWriterElement = document.getElementById('typewriter-text');

	const rawData = typeWriterElement.getAttribute('data-texts');
	const textsArray = JSON.parse(rawData);

	const textToType = textsArray[0];

	let index = 0;

	if (!typeWriterElement) return;
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

	setTimeout(typeWriter, 500);
});
