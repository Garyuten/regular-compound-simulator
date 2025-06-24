// calculator.js

function calculateCompoundInterest(principal, rate, timesCompounded, years) {
    const amount = principal * Math.pow((1 + rate / timesCompounded), timesCompounded * years);
    return amount.toFixed(2);
}

// Example usage
console.log(calculateCompoundInterest(1000, 0.05, 4, 5)); // Example output