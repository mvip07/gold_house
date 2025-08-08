let currentInput = "0";
let operation = null;
let previousInput = null;

document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContent;

        if (!isNaN(value) || value === ".") {
            currentInput = currentInput === "0" ? value : currentInput + value;
        } else if (["+", "-", "x", "/"].includes(value)) {
            operation = value;
            previousInput = currentInput;
            currentInput = "0";
        } else if (value === "=") {
            let result;
            const prev = parseFloat(previousInput);
            const curr = parseFloat(currentInput);
            switch (operation) {
                case "+": result = prev + curr; break;
                case "-": result = prev - curr; break;
                case "x": result = prev * curr; break;
                case "/": result = curr !== 0 ? prev / curr : "Error"; break;
                default: result = curr;
            }
            currentInput = result.toString();
            operation = null;
            previousInput = null;
        }

        document.getElementById("result").value = currentInput;
    });
});