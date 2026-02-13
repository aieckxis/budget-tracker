const balanceDisplay = document.getElementById('balance');
const list = document.getElementById('list');
const form = document.getElementById('transaction-form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const type = document.getElementById('type');
const category = document.getElementById('category');

// load transactions from local storage
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// load starting balance
let initialBalance = localStorage.getItem('startingBalance') !== null 
    ? parseFloat(localStorage.getItem('startingBalance')) 
    : 0;

let myChart;

// add new entry
function addTransaction(e) {
  e.preventDefault();

  const amt = +amount.value;
  const finalAmount = type.value === 'expense' ? -Math.abs(amt) : Math.abs(amt);

  const transaction = {
    id: Math.floor(Math.random() * 100000000),
    text: text.value,
    amount: finalAmount,
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

// display item on screen
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    ${transaction.text} <span>${sign}$${Math.abs(transaction.amount).toFixed(2)}</span>
  `;

  list.appendChild(item);
}

// delete logic
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  updateLocalStorage();
  updateChart();
  init();
}

// data visualization logic
function updateChart() {
  const expenses = transactions.filter(t => t.amount < 0);
  const needsTotal = Math.abs(expenses.filter(t => t.category === 'needs').reduce((acc, t) => acc + t.amount, 0));
  const wantsTotal = Math.abs(expenses.filter(t => t.category === 'wants').reduce((acc, t) => acc + t.amount, 0));

  const ctx = document.getElementById('budgetChart').getContext('2d');

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Needs', 'Wants'],
      datasets: [{
        data: [needsTotal, wantsTotal],
        backgroundColor: ['#2ecc71', '#9c27b0'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// sync numbers and balance
function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const transactionTotal = amounts.reduce((acc, item) => (acc += item), 0);
  const finalTotal = (initialBalance + transactionTotal).toFixed(2);
  balanceDisplay.value = finalTotal;
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// update when balance input changes
balanceDisplay.addEventListener('change', (e) => {
  const currentTotalTransactions = transactions.reduce((acc, t) => acc + t.amount, 0);
  initialBalance = parseFloat(e.target.value) - currentTotalTransactions;
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