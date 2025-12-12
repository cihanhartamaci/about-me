// Test date parsing
const start = "2025-12-12";
const [startYear, startMonth, startDay] = start.split('-').map(Number);
const customStartDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);

console.log("Input string:", start);
console.log("Parsed date:", customStartDate);
console.log("ISO String:", customStartDate.toISOString());
console.log("Local String:", customStartDate.toLocaleString());
