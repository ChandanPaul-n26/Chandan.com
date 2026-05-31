// Get DOM elements
const expanceNameInput = document.getElementById('expanceName');
const expanceAmountInput = document.getElementById('expanceAmount');
const expanceTypeSelect = document.getElementById('expanceType');
const expanceDateInput = document.getElementById('expanceDate');
const addExpanceButton = document.getElementById('addExpance');
const expanceListBody = document.getElementById('expanceList');
const totalExpanceSpan = document.getElementById('totalExpance');
const filterCategorySelect = document.getElementById('filter-category');

// Array to store expense data
let expenses = [];

// Function to render expenses to the table
const renderExpenses = () => {
    expanceListBody.innerHTML = ''; // Clear existing table rows
    let totalExpance = 0;

    const filteredExpenses = expenses.filter(expense => {
        return filterCategorySelect.value === 'All' || expense.type === filterCategorySelect.value;
    });

    filteredExpenses.forEach((expense) => {
        const originalIndex = expenses.indexOf(expense);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.name}</td>
            <td>$${expense.amount}</td>
            <td>${expense.type}</td>
            <td>${expense.date}</td>
            <td>
                <button class="edit-btn" data-index="${originalIndex}">Edit</button>
                <button class="delete-btn" data-index="${originalIndex}">Delete</button>
            </td>
        `;
        expanceListBody.appendChild(row);
        totalExpance += parseFloat(expense.amount);
    });

    totalExpanceSpan.textContent = totalExpance.toFixed(2);
};

// Function to handle adding a new expense
const addExpance = () => {
    const name = expanceNameInput.value;
    const amount = expanceAmountInput.value;
    const type = expanceTypeSelect.value;
    const date = expanceDateInput.value;
    const editIndex = addExpanceButton.dataset.editIndex;

    if (name && amount && date) {
        const newExpense = {
            name: name,
            amount: parseFloat(amount).toFixed(2),
            type: type,
            date: date
        };
        if (editIndex !== undefined) {
            expenses[editIndex] = newExpense;
            addExpanceButton.textContent = 'Add';
            delete addExpanceButton.dataset.editIndex;
        } else {
            expenses.push(newExpense);
        }
        renderExpenses();
        clearInputs();
        saveExpensesToServer();
    } else {
        alert('Please fill in all fields.');
    }
};

// Function to handle deleting an expense
const deleteExpance = (event) => {
    if (event.target.classList.contains('delete-btn')) {
        const index = event.target.dataset.index;
        expenses.splice(index, 1);
        renderExpenses();
        saveExpensesToServer();
    }
};

// Function to handle editing an expense
const editExpance = (event) => {
    if (event.target.classList.contains('edit-btn')) {
        const index = event.target.dataset.index;
        const expense = expenses[index];
        expanceNameInput.value = expense.name;
        expanceAmountInput.value = expense.amount;
        expanceTypeSelect.value = expense.type;
        expanceDateInput.value = expense.date;
        addExpanceButton.textContent = 'Update';
        addExpanceButton.dataset.editIndex = index;
    }
};

// Function to clear input fields
const clearInputs = () => {
    expanceNameInput.value = '';
    expanceAmountInput.value = '';
    expanceTypeSelect.value = 'Food';
    expanceDateInput.value = '';
    addExpanceButton.textContent = 'Add';
    delete addExpanceButton.dataset.editIndex;
};

// Function to save expenses to Data.txt on the backend
async function saveExpensesToServer() {
    try {
        await fetch('/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenses)
        });
    } catch (e) {
        console.error('Failed to save expenses on server:', e);
    }
}

// Function to load expenses from backend file
async function loadExpensesFromServer() {
    try {
        const res = await fetch('/expenses');
        if (res.ok) {
            const data = await res.json();
            expenses = data;
            renderExpenses();
        } else {
            console.warn('Could not load expenses from server, status', res.status);
        }
    } catch (e) {
        console.error('Error loading expenses:', e);
    }
}

// Event listeners
addExpanceButton.addEventListener('click', addExpance);
expanceListBody.addEventListener('click', deleteExpance);
expanceListBody.addEventListener('click', editExpance);
filterCategorySelect.addEventListener('change', renderExpenses);

// Initial loading of expenses from backend file
loadExpensesFromServer();