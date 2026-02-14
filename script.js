const balanceDisplay = document.getElementById('balance');
const moneyPlus = document.getElementById('money-plus');
const moneyMinus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('transaction-form');
const themeToggle = document.getElementById('theme-toggle');
const typeSelect = document.getElementById('type');
const categoryWrapper = document.getElementById('category-wrapper');
const clearBtn = document.getElementById('clear-btn');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let initialBalance = parseFloat(localStorage.getItem('startingBalance')) || 0;
let myChart;

// 1. Theme Persistence Logic
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateToggleIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
    updateToggleIcon(target);
    updateChart(); // Redraw chart for color contrast
});

function updateToggleIcon(theme) {
    themeToggle.innerHTML = theme === 'light' ? '☀️ light mode' : '🌙 dark mode';
}

// 2. UX: Hide Category for Income
typeSelect.addEventListener('change', () => {
    categoryWrapper.style.display = typeSelect.value === 'income' ? 'none' : 'block';
});

// 3. Robust Chart Logic (Fixes the "not repeating" issue)
function updateChart() {
    const expenses = transactions.filter(t => t.amount < 0);
    const needs = Math.abs(expenses.filter(t => t.category === 'needs').reduce((acc, t) => acc + t.amount, 0));
    const wants = Math.abs(expenses.filter(t => t.category === 'wants').reduce((acc, t) => acc + t.amount, 0));

    const ctx = document.getElementById('budgetChart').getContext('2d');
    
    // Destroy previous instance to clear memory and visual cache
    if (myChart) myChart.destroy();

    const hasData = needs > 0 || wants > 0;

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['needs', 'wants'],
            datasets: [{
                // Use 0 if no data, preventing the chart from showing old values
                data: [needs || 0, wants || 0],
                backgroundColor: ['#2ecc71', '#9c27b0'],
                borderWidth: 0
            }]
        },
        options: { 
            maintainAspectRatio: false,
            cutout: '80%', 
            plugins: { 
                legend: { display: false },
                tooltip: { enabled: hasData } // Only show tooltips if there's data
            } 
        }
    });
}

// 4. State Management & CRUD
function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = (initialBalance + amounts.reduce((acc, i) => acc + i, 0)).toFixed(2);
    balanceDisplay.value = total;
    
    const income = amounts.filter(i => i > 0).reduce((acc, i) => acc + i, 0).toFixed(2);
    const expense = Math.abs(amounts.filter(i => i < 0).reduce((acc, i) => acc + i, 0)).toFixed(2);
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
    categoryWrapper.style.display = 'block'; // Reset UX visibility
});

function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    init();
}

// Clear All Logic (Triggers Chart Reset)
clearBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear your entire history?")) {
        transactions = [];
        localStorage.setItem('transactions', JSON.stringify(transactions));
        init(); // This calls updateChart() which now handles 0 values
    }
});

// Sync Initial Balance
balanceDisplay.addEventListener('change', (e) => {
    const currentTotal = transactions.reduce((acc, t) => acc + t.amount, 0);
    initialBalance = parseFloat(e.target.value) - currentTotal;
    localStorage.setItem('startingBalance', initialBalance);
    updateValues();
});

function init() {
    list.innerHTML = '';
    transactions.forEach(t => {
        const item = document.createElement('li');
        item.innerHTML = `
            <button class="delete-btn" onclick="removeTransaction(${t.id})">x</button>
            ${t.text} <span>₱${Math.abs(t.amount).toFixed(2)}</span>
        `;
        list.appendChild(item);
    });
    updateValues();
    updateChart();
}

init();