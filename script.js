const balanceDisplay = document.getElementById('balance');
const moneyPlus = document.getElementById('money-plus');
const moneyMinus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('transaction-form');
const themeToggle = document.getElementById('theme-toggle');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let initialBalance = parseFloat(localStorage.getItem('startingBalance')) || 0;
let myChart;

// theme logic
if (localStorage.getItem('theme') === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.innerText = '☀️ light mode';
}

themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerText = '🌙 dark mode';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggle.innerText = '☀️ light mode';
    }
    updateChart();
});

function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const income = amounts.filter(i => i > 0).reduce((acc, i) => acc + i, 0).toFixed(2);
    const expense = Math.abs(amounts.filter(i => i < 0).reduce((acc, i) => acc + i, 0)).toFixed(2);
    const total = (initialBalance + amounts.reduce((acc, i) => acc + i, 0)).toFixed(2);

    balanceDisplay.value = total;
    moneyPlus.innerText = `+₱${income}`;
    moneyMinus.innerText = `-₱${expense}`;
}

function updateChart() {
    const expenses = transactions.filter(t => t.amount < 0);
    const needs = Math.abs(expenses.filter(t => t.category === 'needs').reduce((acc, t) => acc + t.amount, 0));
    const wants = Math.abs(expenses.filter(t => t.category === 'wants').reduce((acc, t) => acc + t.amount, 0));

    const canvas = document.getElementById('budgetChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['needs', 'wants'],
            datasets: [{
                data: [needs || 1, wants || 0.1], 
                backgroundColor: ['#2ecc71', '#9c27b0'],
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim(),
                borderWidth: 5
            }]
        },
        options: { 
            maintainAspectRatio: false,
            cutout: '80%', 
            plugins: { legend: { display: false } } 
        }
    });
}

function addTransaction(e) {
    e.preventDefault();
    const text = document.getElementById('text');
    const amount = document.getElementById('amount');
    const type = document.getElementById('type');
    const category = document.getElementById('category');

    const transaction = {
        id: Math.floor(Math.random() * 100000000),
        text: text.value,
        amount: type.value === 'expense' ? -Math.abs(+amount.value) : +amount.value,
        category: category.value
    };

    transactions.push(transaction);
    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();
    updateChart();

    text.value = '';
    amount.value = '';
}

function addTransactionDOM(t) {
    const item = document.createElement('li');
    item.classList.add(t.amount < 0 ? 'minus' : 'plus');
    item.innerHTML = `
        <button class="delete-btn" onclick="removeTransaction(${t.id})">x</button>
        ${t.text} <span>${t.amount < 0 ? '-' : '+'}₱${Math.abs(t.amount).toFixed(2)}</span>
    `;
    list.appendChild(item);
}

function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

balanceDisplay.addEventListener('change', (e) => {
    const currentTotal = transactions.reduce((acc, t) => acc + t.amount, 0);
    initialBalance = parseFloat(e.target.value) - currentTotal;
    localStorage.setItem('startingBalance', initialBalance);
    updateValues();
});

function init() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
    updateChart();
}

form.addEventListener('submit', addTransaction);
init();