function setMinutes(event) {
	const timer = event.target.getRootNode().host;
	timer.setAttribute('minutes', event.target.value);
}

function setSeconds(event) {
	const timer = event.target.getRootNode().host;
	timer.setAttribute('seconds', event.target.value);
}

const formatMs = (ms) => {
	const seconds = ms / 1000;
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	const secondsPadding = '0'.repeat(2 - String(remainingSeconds).length);
	const remainingMilliseconds = Math.floor(ms % 1000);
	const msPadding = '0'.repeat(3 - String(remainingMilliseconds).length);
	return `${minutes}:${secondsPadding}${remainingSeconds}:${msPadding}${remainingMilliseconds}`;
};

function startTimer(event) {
	const timer = event.target.getRootNode().host;

	// get the minutes and seconds, and add that to the target time
	const seconds = timer.getAttribute('seconds');
	const minutes = timer.getAttribute('minutes');
	const setTime = minutes * 60 * 1000 + seconds * 1000;
	timer.setAttribute('targettime', new Date().getTime() + setTime);

	function update() {
		const remainingMS = timer.getAttribute('targettime') - new Date().getTime();
		timer.setAttribute('remainingms', formatMs(Math.max(remainingMS, 0)));
		if (remainingMS > 0) {
			window.requestAnimationFrame(update);
		}
	}

	window.requestAnimationFrame(update);
}

define`
  <tram-timer ${'totalms'}>
		<label>Minutes: <input onkeyup="setMinutes(event)" size="5"></label>
		<label>Seconds: <input onkeyup="setSeconds(event)" size="5"></label>

    <button onclick="startTimer(event)">Start!</button>
		<br>
		${'remainingms'}
  </tram-timer>
`;

const tt = html`
	<div style="padding-top: 5px;">
		<tram-timer></tram-timer>
	</div>
`;
document.body.appendChild(tt);
