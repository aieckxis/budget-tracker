const balanceDisplay = document.getElementById('balance');
const moneyPlus = document.getElementById('money-plus');
const moneyMinus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('transaction-form');
const themeToggle = document.getElementById('theme-toggle');
const typeSelect = document.getElementById('type');
const categoryWrapper = document.getElementById('category-wrapper');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let initialBalance = parseFloat(localStorage.getItem('startingBalance')) || 0;
let myChart;

// 1. Theme Logic
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.innerText = savedTheme === 'light' ? '☀️ light mode' : '🌙 dark mode';

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
    themeToggle.innerText = target === 'light' ? '☀️ light mode' : '🌙 dark mode';
    updateChart();
});

// 2. UX: Dynamic Form
typeSelect.addEventListener('change', () => {
    categoryWrapper.style.display = typeSelect.value === 'income' ? 'none' : 'block';
});

// 3. Robust Chart Logic (Hard Reset)
function updateChart() {
    const expenses = transactions.filter(t => t.amount < 0);
    
    const canvas = document.getElementById('budgetChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. Siguradong burado ang lumang chart instance
    if (myChart) {
        myChart.destroy();
    }

    // 2. HARD RESET
    if (expenses.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return; 
    }

    // 3. Calculate data 
    const needs = Math.abs(expenses.filter(t => t.category === 'needs').reduce((acc, t) => acc + t.amount, 0));
    const wants = Math.abs(expenses.filter(t => t.category === 'wants').reduce((acc, t) => acc + t.amount, 0));

    // 4. Draw only if there is real data > 0
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['needs', 'wants'],
            datasets: [{
                data: [needs, wants],
                backgroundColor: ['#2ecc71', '#9c27b0'],
                borderWidth: 0
            }]
        },
        options: { 
            maintainAspectRatio: false,
            cutout: '80%', 
            plugins: { 
                legend: { display: false }
            } 
        }
    });
}

function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const income = amounts.filter(i => i > 0).reduce((acc, i) => acc + i, 0).toFixed(2);
    const expense = Math.abs(amounts.filter(i => i < 0).reduce((acc, i) => acc + i, 0)).toFixed(2);
    const total = (initialBalance + amounts.reduce((acc, i) => acc + i, 0)).toFixed(2);

    balanceDisplay.value = total;
    moneyPlus.innerText = `+₱${income}`;
    moneyMinus.innerText = `-₱${expense}`;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = typeSelect.value;
    const transaction = {
        id: Math.floor(Math.random() * 100000000),
        text: document.getElementById('text').value,
        amount: type === 'expense' ? -Math.abs(+document.getElementById('amount').value) : +document.getElementById('amount').value,
        category: type === 'income' ? 'income' : document.getElementById('category').value
    };
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    init();
    form.reset();
    categoryWrapper.style.display = 'block';
});

function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    init();
}

document.getElementById('clear-btn').addEventListener('click', () => {
    if(confirm("Clear all history?")) {
        transactions = [];
        localStorage.setItem('transactions', JSON.stringify(transactions));
        init();
    }
});

function init() {
    list.innerHTML = '';
    transactions.forEach(t => {
        const item = document.createElement('li');
        item.innerHTML = `<button class="delete-btn" onclick="removeTransaction(${t.id})">x</button>${t.text} <span>₱${Math.abs(t.amount).toFixed(2)}</span>`;
        list.appendChild(item);
    });
    updateValues();
    updateChart();
}

init();