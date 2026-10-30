// Converts a raw date value into a human-friendly date string

export function formatDate(dateString) {
    const d = new Date(dateString); // Creates a new date object
    return d.toLocaleDateString(); // formatted so can be easily read by users
}