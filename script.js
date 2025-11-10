let display = document.getElementById("display");
let lastResult = null;
let lastOperator = null;
let lastOperand = null;
let justCalculated = false;

function add2Display(input) {
  if (display.value === "Error") display.value = "";

  if (justCalculated && /^[0-9.]$/.test(input)) {
    display.value = "";
    justCalculated = false;
  } else {
    justCalculated = false;
  }

  let current = display.value;
  let lastChar = display.value.slice(-1);
  let operators = "+-*/%";

  if (input === "±") {
    toggleSign();
    return;
  }

  if (display.value === "" && operators.includes(input) && input !== "-") {
    return;
  }

  if (operators.includes(lastChar) && operators.includes(input)) {
    current = current.slice(0, -1) + input;
    console.log(current)
    display.value = current;
    return;
  }

   if (input === ".") {
    if (current === "" || operators.includes(lastChar)) {
      display.value += "0.";
      return;
    }

    let lastNumber = current.split(/[-+*/%]/).pop();
    if (lastNumber.includes(".")) return;
   }

  display.value += input;
  console.log(display.value);
}

function clearDisplay() {
  display.value = "";
  lastResult = null;
  lastOperator = null;
  lastOperand = null;
  justCalculated = false;
}

function back() {
  display.value = display.value.slice(0, -1);
} 

function calculate() {
  try {
    const rawDisplay = display.value.trim();

    // Repeat "=" like Windows calculator
    if (
      (rawDisplay === "" || justCalculated || String(rawDisplay) === String(lastResult)) &&
      lastOperator &&
      lastOperand != null
    ) { 
      const repeatExpr = `${lastResult}${lastOperator}${lastOperand}`;
      let repeatResult = eval(repeatExpr);
      if (!isFinite(repeatResult)) throw Error();
      repeatResult = parseFloat(repeatResult.toFixed(6));
      display.value = repeatResult;
      lastResult = repeatResult;
      justCalculated = true;
      return;
    }

    let expression = preprocessPercentage(rawDisplay);
    let result = eval(expression);

    if (!isFinite(result) || isNaN(result)) {
      display.value = "Error";
      justCalculated = true;
      return;
    }

    result = parseFloat(result.toFixed(6));

    // Extract last operator & operand for repeat "=" logic
    const match = rawDisplay.match(/(.+?)([+\-*/])\s*(-?\d+(\.\d+)?)\s*$/);
    if (match) {
      lastResult = result;
      lastOperator = match[2];
      lastOperand = parseFloat(match[3]);
    } else {
      lastOperator = null;
      lastOperand = null;
      lastResult = result;
    }
    console.log(result);
    display.value = result;
    justCalculated = true;
  } catch {
    display.value = "Error";
    justCalculated = true;
  }
}

function preprocessPercentage(expression) {
  // First: handle cases like "200 + 10%" or "200-10%" where percent is relative to the left number
  expression = expression.replace(
    /(\d+(\.\d+)?)\s*([+\-])\s*(\d+(\.\d+)?)%/g,
    (match, num1, _dec1, operator, num2) => {
      // num1 + (num1 * num2 / 100)  or  num1 - (num1 * num2 / 100)
      return `${num1}${operator}(${num1}*${num2}/100)`;
    }
  );

  // Second: convert any remaining "N%" → "(N/100)" (covers cases like 20% or 100*20%)
  expression = expression.replace(/(\d+(\.\d+)?)%/g, (match, num) => {
    return `(${num}/100)`;
  });

  return expression;
}


function toggleSign() {
  if (display.value === "") {
    display.value = "-";
    return;
  }

  let match = display.value.match(/(-?\d+(\.\d+)?)$/);
  if (match) {
    let num = match[0];
    let start = display.value.slice(0, -num.length);
    if (num.startsWith("-")) {
      display.value = start + num.slice(1);
    } else {
      display.value = start + "-" + num;
    }
    return;
  }
}

display.addEventListener("input", () => {
  if (display.value === "Error") {
    display.value = "";
    return;
  }

  display.value = display.value.replace(/[^0-9+\-*/%.()]/g, "");
  display.value = display.value.replace(/([+\-*/%]){2,}/g, "$1");
  display.value = display.value.replace(/^[+*/%]+/, "");
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (document.activeElement === display) return;

  if (key === "Enter") {
    event.preventDefault();
    calculate();
    return;
  }

  if (key === "Backspace") {
    event.preventDefault();
    back();
    return;
  }

  if (key === "Escape" || key === "Delete") {
    event.preventDefault();
    clearDisplay();
    return;
  }

  if (/^[0-9+\-*/%.()]$/.test(key)) {
    event.preventDefault();
    add2Display(key);
    return;
  }
});