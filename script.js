const display = document.getElementById('display');

let lastOperator = null;
let lastOperand = null;

function add2Display(value) {
  if (value === '±') {
    toggleSign();
    return;
  }
  if (value === '%') {
    percent();
    return;
  }

  const operators = ['+', '-', '*', '/', '%'];
  const current = display.value;
  const lastChar = current.slice(-1);
  const normalizedLast = lastChar.replace('×', '*').replace('÷', '/').replace('−', '-');
  const normalizedValue = value.replace('×', '*').replace('÷', '/').replace('−', '-');

  if (operators.includes(normalizedLast) && operators.includes(normalizedValue)) {
    display.value = current.slice(0, -1) + value;
    return;
  }

  if (current === "0" && !operators.includes(normalizedValue) && value !== ".") {
    display.value = value;
  } else {
    display.value = current + value;
  }
}

function clearDisplay() {
  display.value = "0";
  lastOperator = null;
  lastOperand = null;
}

function back() {
  display.value = display.value.slice(0, -1) || "0";
}

function _roundIfFloat(num) {
  if (!Number.isFinite(num)) return num;
  if (Math.floor(num) === num) return num;
  return parseFloat(num.toFixed(12));
}

function calculate() {
  try {
    let expression = display.value
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-");

    const ops = ['+', '-', '*', '/'];
    const lastChar = expression.slice(-1);

    if (ops.includes(lastChar)) {
      const num = parseFloat(expression.slice(0, -1));
      lastOperator = lastChar;
      lastOperand = num;
      expression = `${num}${lastChar}${num}`;
    } else if (lastOperator && !ops.some(o => lastChar === o)) {
      expression = `${expression}${lastOperator}${lastOperand}`;
    } else {
      const match = expression.match(/([\+\-\*\/])([^+\-*/]+)$/);
      if (match) {
        lastOperator = match[1];
        lastOperand = parseFloat(match[2]);
      }
    }

    expression = expression.trim();
    const rawResult = eval(expression);
    if (!Number.isFinite(rawResult) || Number.isNaN(rawResult)) {
      display.value = "Error";
      return;
    }
    const result = _roundIfFloat(rawResult);
    display.value = String(result);
  } catch (e) {
    display.value = "Error";
  }
}

function toggleSign() {
  const expr = display.value;
  const lastNumberMatch = expr.match(/(-?)(\d+(\.\d+)?)(?!.*\d)/);
  if (!lastNumberMatch) {
    if (expr.startsWith("-")) display.value = expr.slice(1);
    else if (expr !== "0") display.value = "-" + expr;
    return;
  }

  const sign = lastNumberMatch[1];
  const number = lastNumberMatch[2];
  const startIndex = expr.lastIndexOf(number);
  if (sign === "-") {
    display.value = expr.slice(0, startIndex - 1) + number;
  } else {
    display.value = expr.slice(0, startIndex) + "-" + number;
  }
}

function percent() {
  const expr = display.value;
  const lastNumberMatch = expr.match(/(\d+(\.\d+)?)(?!.*\d)/);
  if (!lastNumberMatch) {
    return;
  }
  const number = lastNumberMatch[0];
  const startIndex = expr.lastIndexOf(number);
  const before = expr.slice(0, startIndex);
  const newNumber = String(parseFloat(number) / 100);
  display.value = before + newNumber;
}

document.addEventListener('keydown', (e) => {
  const key = e.key;

  const allowedKeys = [
    "0","1","2","3","4","5","6","7","8","9",
    "+","-","*","/","%","(",")",".","Backspace","Enter","=","Escape"
  ];

  if (!allowedKeys.includes(key)) {
    return;
  }

  if (key === "Enter" || key === "=") {
    e.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    e.preventDefault();
    back();
  } else if (key === "Escape") {
    e.preventDefault();
    clearDisplay();
  } else if (key === "%") {
    e.preventDefault();
    percent();
  } else {
    add2Display(key);
  }
});