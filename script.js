const balanceDisplay = document.getElementById('balance');
const list = document.getElementById('list');
const form = document.getElementById('transaction-form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const type = document.getElementById('type');

const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

let initialBalance = localStorage.getItem('startingBalance') !== null 
    ? parseFloat(localStorage.getItem('startingBalance')) 
    : 0;

function addTransaction(e) {
  e.preventDefault();

  const amt = +amount.value;
  const finalAmount = type.value === 'expense' ? -Math.abs(amt) : Math.abs(amt);

  const transaction = {
    id: Math.floor(Math.random() * 100000000),
    text: text.value,
    amount: finalAmount
  };

  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateValues();
  updateLocalStorage();

  text.value = '';
  amount.value = '';
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `
    ${transaction.text} <span>${sign}₱${Math.abs(transaction.amount).toFixed(2)}</span>
  `;

  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const transactionTotal = amounts.reduce((acc, item) => (acc += item), 0);
  const finalTotal = (initialBalance + transactionTotal).toFixed(2);
  balanceDisplay.value = finalTotal;
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

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
}

form.addEventListener('submit', addTransaction);
init();