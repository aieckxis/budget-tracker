const balanceDisplay = document.getElementById('balance');
const moneyPlus = document.getElementById('money-plus');
const moneyMinus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('transaction-form');

// state management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let initialBalance = parseFloat(localStorage.getItem('startingBalance')) || 0;
let myChart;

// software eng: refined value calculation
function updateValues() {
  const amounts = transactions.map(t => t.amount);
  
  const totalIncome = amounts
    .filter(item => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);

  const totalExpense = Math.abs(amounts
    .filter(item => item < 0)
    .reduce((acc, item) => (acc += item), 0))
    .toFixed(2);

  const transactionTotal = amounts.reduce((acc, item) => (acc += item), 0);
  
  balanceDisplay.value = (initialBalance + transactionTotal).toFixed(2);
  moneyPlus.innerText = `+$${totalIncome}`;
  moneyMinus.innerText = `-$${totalExpense}`;
}

// software eng: improved data filtering for chart
function updateChart() {
  const expenses = transactions.filter(t => t.amount < 0);
  const needs = Math.abs(expenses.filter(t => t.category === 'needs').reduce((acc, t) => acc + t.amount, 0));
  const wants = Math.abs(expenses.filter(t => t.category === 'wants').reduce((acc, t) => acc + t.amount, 0));

  const ctx = document.getElementById('budgetChart').getContext('2d');
  if (myChart) myChart.destroy();

  myChart = new Chart(ctx, {
    type: 'doughnut', // ux: cleaner look than a standard pie
    data: {
      labels: ['Needs', 'Wants'],
      datasets: [{
        data: [needs || 1, wants || 1], // default 1 to show empty state
        backgroundColor: ['#2ecc71', '#9c27b0'],
        borderColor: '#161b22',
        borderWidth: 4
      }]
    },
    options: {
      cutout: '70%',
      plugins: { legend: { display: false } }
    }
  });
}

function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
  updateChart();
}

// ... existing helper functions (addTransactionDOM, removeTransaction, etc)
init();