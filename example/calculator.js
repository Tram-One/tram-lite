const calcState = {
	value: '0',
	operator: '+',
	memory: '0',
	tape: [],
};

const currentEval = () => {
	return eval(`${calcState.memory} ${calcState.operator} ${calcState.value}`);
};

const updateDisplay = () => {
	document.querySelector('calc-value').innerHTML = calcState.value;
	document.querySelector('calc-operator').innerHTML = calcState.operator;
	document.querySelector('calc-memory').innerHTML = calcState.memory;
	document.querySelector('calc-tape').innerHTML = calcState.tape.join('<br />');
	document.querySelector('calc-preview').innerHTML = `= ${currentEval()}`;
};

updateDisplay();

const onPressDigit = (num) => () => {
	calcState.value = `${parseInt(calcState.value + num)}`;
	updateDisplay();
};

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((digit) => {
	const calcButton = html` <button onclick=${onPressDigit(digit)}>${digit}</button> `;
	document.querySelector('calc-controls').appendChild(calcButton);
});

const onPressOperator = (operator) => () => {
	const result = currentEval();
	calcState.tape.push(`${calcState.memory} ${calcState.operator} ${calcState.value} = ${result}`);
	calcState.memory = result;
	calcState.operator = operator;
	calcState.value = '0';
	console.log(calcState.memory);
	updateDisplay();
};

['+', '-', '/', '*'].forEach((operator) => {
	const operatorButton = html`<button onclick=${onPressOperator(operator)}>${operator}</button>`;
	document.querySelector('calc-controls').appendChild(operatorButton);
});

const onPressClear = () => {
	calcState.memory = '0';
	calcState.operator = '+';
	calcState.value = '0';
	updateDisplay();
};

const clearButton = html`<button onclick=${onPressClear}>Clear</button>`;
document.querySelector('calc-controls').appendChild(clearButton);

const onPressBackspace = () => {
	calcState.value = '0';
	updateDisplay();
};

const backspaceButton = html`<button onclick=${onPressBackspace}>⌫</button>`;
document.querySelector('calc-controls').appendChild(backspaceButton);
