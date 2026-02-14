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

function addTransaction(e) {
  e.preventDefault();
  const amountInput = document.getElementById('amount');
  const typeInput = document.getElementById('type');
  const textInput = document.getElementById('text');
  const categoryInput = document.getElementById('category');

  const amt = +amountInput.value;
  const finalAmount = typeInput.value === 'expense' ? -Math.abs(amt) : Math.abs(amt);

  const transaction = {
    id: Math.floor(Math.random() * 100000000),
    text: textInput.value,
    amount: finalAmount,
    category: categoryInput.value
  };

  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateValues();
  updateLocalStorage();
  updateChart();

  textInput.value = '';
  amountInput.value = '';
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    ${transaction.text} <span>${sign}₱${Math.abs(transaction.amount).toFixed(2)}</span>
  `;
  list.appendChild(item);
}

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  init();
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

function updateChart() {
  const expenses = transactions.filter(t => t.amount < 0);
  const needs = Math.abs(expenses.filter(t => t.category === 'needs').reduce((acc, t) => acc + t.amount, 0));
  const wants = Math.abs(expenses.filter(t => t.category === 'wants').reduce((acc, t) => acc + t.amount, 0));

  const ctx = document.getElementById('budgetChart').getContext('2d');
  if (myChart) myChart.destroy();

  myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Needs', 'Wants'],
      datasets: [{
        data: [needs || 1, wants || 0.1], 
        backgroundColor: ['#2ecc71', '#9c27b0'],
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
        borderWidth: 5
      }]
    },
    options: { cutout: '80%', plugins: { legend: { display: false } } }
  });
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

balanceDisplay.addEventListener('change', (e) => {
  const currentTransactionsTotal = transactions.reduce((acc, t) => acc + t.amount, 0);
  initialBalance = parseFloat(e.target.value) - currentTransactionsTotal;
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