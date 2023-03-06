let count = 0;
const increment = () => {
	console.log('INCREMENTING!', count++);
};

const counter = html` <button onclick=${increment}>increment</button> `;

document.body.appendChild(counter);
