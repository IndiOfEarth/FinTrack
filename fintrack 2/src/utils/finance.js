// Takes a date and converts int into the first day of that month
export function getMonthStartDate(dateObj = new Date()) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-01`; // YYYY-MM-01
}

// Turns the JS Date into a month identifer string (e.g. "2026-02")
// Why? Grouping transactions by the month, querying budgets per month, labeling charts, caching monthly data
export function getMonthKey(dateObj = new Date()) {
    const y = dateObj.getFullYear(); // gets the year
    const m = String(dateObj.getMonth() + 1).padStart(2, "0"); // get the month
    return `${y}-${m}`; // will return e.g. 2026-02
}

// Checks if the date belongs to a given month
// returns a boolean (true or false)
export function isInMonth(dateString, monthKey) {
    // e.g. isInMonth("2026-02-14", "2026-02")
    return typeof dateString === "string" && dateString.startsWith(monthKey);
}

// From all transactions keep only ones in this month
// An important function as it will filter the transaction to keep only ones in this month
export function filterTransactionsByMonth(transactions, monthKey) {
    // transactions ?? [] - avoids crashes if null
    // Reused the isInMonth() function (Don't Repeat Yourself principle) 
    // returns an arrat of transactions for a given month (if in month is TRUE)
    return (transactions ?? []).filter((t) => isInMonth(t.date, monthKey));
}

// Adds up the amounts of all transactions of a given type
// type is only either "income" or "expense"
// adds together amounts for each type
// returns a total value
export function sumByType(transactions, type) {
    return (transactions ?? []).filter((t) => t.type === type).reduce((acc, t) => acc + Number(t.amount || 0), 0);
}

// For each type of transaction "expenses" and "income"
// Call the sumByType function
export function sumExpenses(transactions) {
    return sumByType(transactions, "expense");
}

export function sumIncome(transactions) {
    return sumByType(transactions, "income");
}

// Sums all the expenses by category
export function sumExpensesByCategory(transactions) {
    const map = new Map();

    for (const t of transactions ?? []) {
        if (t.type !== "expense") continue;
        const id = t?.category?.id ?? "unknown";
        const name = t?.category?.name ?? "Other";
        const icon = t?.category?.icon ?? "";
        const key = id;
        
        const prev = map.get(key) ?? { category_id: id, name, icon, spent: 0};
        prev.spent += Number(t.amount || 0);
        map.set(key, prev);
    }

    return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
}

// Calculates the progress based on amount spent and limit for the category/budget
export function progress(spent, limit) {
    if (!limit || limit <= 0) return 0;
    return Math.min(spent / limit, 1);
}

// Groups all the expenses by category and totals them
export function groupExpensesByCategory(transactions) {
    const map = new Map();

    // ?? [] - If transactions are missing or empty use an empty list instead
    // Loops over the transactions
    for (const t of transactions ?? []) {
        if (t.type !== "expense") continue; // skip any non-expenses
        const catName = t?.category?.name ?? "Other"; // get category info safely or "Other"
        const catIcon = t?.category?.icon ?? ""; // icon or "" (empty)
        const key = `${catIcon} ${catName}`.trim();
        
        // accumulate by adding this transaction's amount to the category total
        map.set(key, (map.get(key) ?? 0) + Number(t.amount || 0));

    }
    // return the sorted list biggest-first
    // e.g. [ {label: "food", total: 120.5}, ...]
    return Array.from(map.entries()).map(([label, total]) => ({label, total})).sort((a,b) => b.total - a.total);
}

// Utility function that takes date and moves forward/backward by a number of months
export function addMonths(dateObj, diff) {
    const d = new Date(dateObj);
    d.setMonth(d.getMonth() + diff);
    return d;
}

// Gets the label for the month that is added to the dashboard
export function formatMonthLabel(dateObj) {
    // "Feb 2026"
    return dateObj.toLocaleString("en-GB", { month: "short", year: "numeric" });
}

// builds the list of recent months for the drop down list on the dashboard
export function buildRecentMonths(count = 12) {
    const now = new Date();
    const months = [];
    for (let i = 0; i< count; i++) {
        const d = addMonths(now, -i);
        months.push({
            key: getMonthKey(d), // "YYYY-MM"
            monthStart: getMonthStartDate(d), // YYYY-MM-01
            label: formatMonthLabel(d) // "Feb-2026"
        });
    }
    return months;
}