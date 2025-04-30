const { program } = require("commander");
const fs = require("fs");
const path = require("path");

// Define CLI options
program
  .option("-d, --description <string>", "description")
  .option("-a, --amount <number>", "amount", parseInt)
  .option("-i, --id <number>", "id", parseInt)
  .option("-m, --month <number>", "month", parseInt);

program.parse();
const { description, amount, id, month } = program.opts();

// File path for storing expenses
const filePath = path.join(__dirname, "expenses.json");

// Initialize the JSON file if it doesn't exist
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]));
}

/**
 * Get all expenses from the file.
 * @returns {Array} expenses
 */
const getExpenses = () => JSON.parse(fs.readFileSync(filePath, "utf8"));

/**
 * Save expenses to the file.
 * @param {Array} expenses
 */
const saveExpenses = (expenses) => {
  fs.writeFileSync(filePath, JSON.stringify(expenses, null, 2));
};

/**
 * Add a new expense to the file.
 * @param {string} description
 * @param {number} amount
 */
const addExpense = (description, amount) => {
  const expenses = getExpenses();
  const newExpense = {
    id: expenses.length + 1,
    date: new Date().toLocaleDateString(),
    description,
    amount,
  };

  expenses.push(newExpense);
  saveExpenses(expenses);
  console.log(`Expense added successfully (ID: ${newExpense.id})`);
};

/**
 * Remove an expense by ID.
 * @param {number} id
 */
const removeExpense = (id) => {
  let expenses = getExpenses();
  const filteredExpenses = expenses.filter((expense) => expense.id !== id);

  if (filteredExpenses.length === expenses.length) {
    console.log(`Expense with ID ${id} not found.`);
    return;
  }

  saveExpenses(filteredExpenses);
  console.log(`Expense with ID ${id} deleted successfully.`);
};

/**
 * Get expense summary for a specific month or all-time total.
 * @param {number} [month]
 */
const getSummary = (month) => {
  const expenses = getExpenses();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const filteredExpenses = month
    ? expenses.filter(
        (expense) => new Date(expense.date).getMonth() + 1 === month
      )
    : expenses;

  const total = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const period = month ? months[month - 1] : "all time";

  console.log(`Total expenses for ${period}: $${total}`);
};

/**
 * List all expenses.
 */
const listExpenses = () => {
  const expenses = getExpenses().map(({ id, date, description, amount }) => ({
    Id: id,
    Date: date,
    Description: description,
    Amount: `$${amount}`,
  }));

  console.table(expenses);
};

// Handle command actions
const action = process.argv[2];

switch (action) {
  case "add":
    if (description && amount) {
      addExpense(description, amount);
    } else {
      console.log(
        "Please provide both description and amount to add an expense."
      );
    }
    break;
  case "list":
    listExpenses();
    break;
  case "summary":
    getSummary(month);
    break;
  case "delete":
    if (id) {
      removeExpense(id);
    } else {
      console.log("Please provide an ID to delete an expense.");
    }
    break;
  default:
    console.log("Invalid action. Use 'add', 'list', 'summary', or 'delete'.");
    break;
}