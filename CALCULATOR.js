/* Calculator logic - safer evaluation and improved input handling */
function Solve(val) {
   const v = document.getElementById('res');
   const operators = ['+', '-', '*', '/', '%', '.'];
   const last = v.value.slice(-1);

   // prevent two operators in a row (except minus for negative numbers is allowed if there's no value)
   if (operators.includes(val)) {
      if (v.value === '' && val === '-') {
         v.value = '-';
         return;
      }
      if (operators.includes(last)) {
         // replace last operator with the new one
         v.value = v.value.slice(0, -1) + val;
         return;
      }
   }

   v.value += val;
}

function Result() {
   const el = document.getElementById('res');
   let expr = el.value;
   if (!expr) return;
   // allow digits, operators, parentheses, decimal, percent and letters for known functions
   if (!/^[0-9+\-*/().%,\sA-Za-z]+$/.test(expr)) {
      el.value = 'Error';
      return;
   }

   // ensure only allowed words (functions/constants) are present
   const allowedWords = ['sin','cos','tan','ln','log','sqrt','pi','e','abs'];
   const words = (expr.match(/[A-Za-z]+/g) || []).map(w => w.toLowerCase());
   for (const w of words) {
      if (!allowedWords.includes(w)) {
         el.value = 'Error';
         return;
      }
   }

   // convert percent like 50% to (50/100)
   expr = expr.replace(/(\d+\.?\d*)%/g, '($1/100)');

   // map functions/constants to Math equivalents
   expr = expr.replace(/\bln\(/g, 'Math.log(');
   expr = expr.replace(/\blog\(/g, 'Math.log10(');
   expr = expr.replace(/\bsin\(/g, 'Math.sin(');
   expr = expr.replace(/\bcos\(/g, 'Math.cos(');
   expr = expr.replace(/\btan\(/g, 'Math.tan(');
   expr = expr.replace(/\bsqrt\(/g, 'Math.sqrt(');
   expr = expr.replace(/\babs\(/g, 'Math.abs(');
   expr = expr.replace(/\bpi\b/gi, 'Math.PI');
   expr = expr.replace(/\be\b/gi, 'Math.E');

   // convert caret operator to JS exponent
   expr = expr.replace(/\^/g, '**');

   try {
      const result = Function('"use strict"; return (' + expr + ')')();
      if (Number.isFinite(result)) {
         el.value = parseFloat(result.toFixed(12)).toString();
      } else {
         el.value = 'Error';
      }
   } catch (e) {
      el.value = 'Error';
   }
}

function Clear() {
   document.getElementById('res').value = '';
}

function Back() {
   const ev = document.getElementById('res');
   ev.value = ev.value.slice(0, -1);
}

// Keyboard support
document.addEventListener('keydown', function (event) {
   const key = event.key;
   // allow digits and basic operators
   if (/^[0-9]$/.test(key) || '+-*/.%'.includes(key)) {
      event.preventDefault();
      Solve(key);
   } else if (key === 'Enter') {
      event.preventDefault();
      Result();
   } else if (key === 'Backspace') {
      event.preventDefault();
      Back();
   } else if (key.toLowerCase() === 'c') {
      event.preventDefault();
      Clear();
   }
});

function toggleSci() {
   const panel = document.getElementById('keys-sci');
   const toggle = document.getElementById('sci-toggle');
   if (!panel) return;
   const visible = panel.classList.toggle('hidden');
   // aria-hidden should be true when hidden; flip accordingly
   panel.setAttribute('aria-hidden', visible ? 'true' : 'false');
   toggle.value = visible ? 'Sci' : 'Std';
}