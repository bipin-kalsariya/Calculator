let display = document.getElementById("display");
let lastResult = null;
let lastOperator = null;
let lastOperand = null;
let justCalculated = false;

function showOnDisplay(val) {
  display.value = val;
  try {
    display.setSelectionRange(display.value.length, display.value.length);
  } catch (e) { }
  display.scrollLeft = display.scrollWidth;
}

function add2Display(input) {
  if (display.value === "Error") showOnDisplay("");

  if (justCalculated && /^[0-9.]$/.test(input)) {
    showOnDisplay("");
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

  if (current === "" && operators.includes(input) && input !== "-") {
    return;
  }

  if (operators.includes(lastChar) && operators.includes(input)) {
    current = current.slice(0, -1) + input;
    showOnDisplay(current);
    return;
  }

  let lastNumber = current.split(/[-+*/%]/).pop() ?? "";

  if (input === "0") {
    if ((lastNumber === "0" || lastNumber === "-0") && !lastNumber.includes(".")) {
      return;
    }
  }

  if (/^[1-9]$/.test(input) && (lastNumber === "0" || lastNumber === "-0")) {
    let prefix = current.slice(0, -lastNumber.length);
    showOnDisplay(prefix + (lastNumber.startsWith("-") ? "-" + input : input));
    return;
  }

   if (input === ".") {
    if (current === "" || operators.includes(lastChar)) {
      showOnDisplay(current + "0.");
      return;
    }

    let lastNumber = current.split(/[-+*/%]/).pop();
    if (lastNumber.includes(".")) return;
   }

  showOnDisplay(current + input);
}

function clearDisplay() {
  showOnDisplay("");
  lastResult = null;
  lastOperator = null;
  lastOperand = null;
  justCalculated = false;
}

function back() {
  showOnDisplay(display.value.slice(0, -1));
} 

function toggleSign() {
  if (display.value === "") {
    showOnDisplay("-");
    return;
  }

  let match = display.value.match(/(-?\d+(\.\d+)?)$/);
  if (match) {
    let num = match[0];
    let start = display.value.slice(0, -num.length);
    if (num.startsWith("-")) {
      showOnDisplay(start + num.slice(1));
    } else {
      showOnDisplay(start + "-" + num);
    }
    return;
  }
}

function calculate() {
  try {
    const rawDisplay = display.value.trim();

    if (
      (rawDisplay === "" || justCalculated || String(rawDisplay) === String(lastResult)) &&
      lastOperator &&
      lastOperand != null
    ) {
      const repeatExpr = `${lastResult}${lastOperator}${lastOperand}`;
      let repeatResult = eval(preprocessPercentage(repeatExpr));
      if (!isFinite(repeatResult)) throw Error();
      repeatResult = parseFloat(repeatResult.toFixed(6));
      showOnDisplay(String(repeatResult));
      lastResult = repeatResult;
      justCalculated = true;
      return;
    }

    const opRegex = /[+\-*/]$/;
    let expression;

    if (opRegex.test(rawDisplay)) {
      const m = rawDisplay.match(/(.+?)([+\-*/])$/);
      if (m) {
        let prefix = m[1];      
        const op = m[2];       

        let lastNumMatch = prefix.match(/(-?\d+(\.\d+)?)$/);

        if (!lastNumMatch) {
          const prefixTrim = prefix.replace(/\.$/, "");
          lastNumMatch = prefixTrim.match(/(-?\d+(\.\d+)?)$/);
        }

        const operandToUse = lastNumMatch ? lastNumMatch[1] : "0";

        expression = rawDisplay + operandToUse;
      } else {
        expression = rawDisplay + "0";
      }
    } else {
      expression = rawDisplay;
    }

    let processed = preprocessPercentage(expression);
    let result = eval(processed);

    if (!isFinite(result) || isNaN(result)) {
      display.value = "Error";
      justCalculated = true;
      return;
    }

    result = parseFloat(result.toFixed(6));

    const match = expression.match(/(.+?)([+\-*/])(-?\d+(\.\d+)?)$/);
    if (match) {
      lastResult = result;
      lastOperator = match[2];
      lastOperand = parseFloat(match[3]);
    } else {
      lastOperator = null;
      lastOperand = null;
      lastResult = result;
    }
    showOnDisplay(String(result));
    justCalculated = true;
  } catch (e) {
    showOnDisplay("Error");
    justCalculated = true;
  }
}

function preprocessPercentage(expression) {
  expression = expression.replace(
    /(\d+(\.\d+)?)\s*([+\-])\s*(\d+(\.\d+)?)%/g,
    (match, num1, _dec1, operator, num2) => {
      return `${num1}${operator}(${num1}*${num2}/100)`;
    }
  );

  expression = expression.replace(/(\d+(\.\d+)?)%/g, (match, num) => {
    return `(${num}/100)`;
  });

  return expression;
}

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (key === "=") {
    event.preventDefault();
    calculate();
    return;
  }

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

  const allowed = "0123456789.+-*/%()";

  if (allowed.includes(key)) {
    event.preventDefault();     
    add2Display(key);
    return;
  }
});