const alertingCount = html`<mock-counter count="4"></mock-counter>`;

// setup observer
addAttributeListener(alertingCount, 'count', () => {
	alert(`New Count: ${alertingCount.getAttribute('count')}`);
});

// update count, which will trigger the alert
alertingCount.setAttribute('count', '5');
