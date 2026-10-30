// Function formats a number as money so always shown with a currency symbol
export function formatMoney(amount, currencySymbol = "£") {
    const num = Number(amount);
    if (Number.isNaN(num)) return `${currencySymbol}0.00`;
    return `${currencySymbol}${num.toFixed(2)}`;
}

// Currency symbol function
export function currencySymbol(code) {
  if (code === "USD") return "$";
  if (code === "EUR") return "€";
  return "£";
}