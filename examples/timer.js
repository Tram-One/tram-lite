define`
  <tram-timer onload="initTimer(this)">
		<form onsubmit="startTimer(this, event)">
			<label>Minutes: <input name="minutes" size="5"></label>
			<label>Seconds: <input name="seconds" size="5"></label>

			<input type="submit" value="Start!">
		</form>
		${'remainingms'}
  </tram-timer>
`;

function initTimer(timer) {
	const form = timer.shadowRoot.querySelector('form');
	const mockEvent = { target: form, preventDefault: () => {} };
	startTimer(form, mockEvent);
}

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

function startTimer(form, event) {
	event.preventDefault();
	const timer = event.target.getRootNode().host;

	// get the minutes and seconds, and add that to the target time
	const seconds = form.seconds.value;
	const minutes = form.minutes.value;
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

const tt = html`
	<tram-example>
		<tram-timer></tram-timer>
	</tram-example>
`;
document.body.appendChild(tt);
