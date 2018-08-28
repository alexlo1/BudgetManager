const MS_IN_DAY = 86400000;

const itemFields = ['date', 'category', 'name', 'income', 'expense'];

const detailsTable = document.getElementById('details-table');
const detailsTbody = document.getElementById('details-tbody');
const rowTemplate = document.getElementById('row-template');

const totalIn = document.getElementById('total-in');
const totalOut = document.getElementById('total-out');
const totalChange = document.getElementById('total-change');
const firstDay = document.getElementById('first-day');
const totalDays = document.getElementById('total-days');

const inputForm = document.getElementById('input-form');
const inputDate = document.getElementById('date-input');
const inputCategory = document.getElementById('category-input');
const inputName = document.getElementById('name-input');
const inputIncome = document.getElementById('income-input');
const inputExpense = document.getElementById('expense-input');

const addButton = document.getElementById('add-button');
const submitButton = document.getElementById('submit-input');
const cancelButton = document.getElementById('cancel-input');

const avgDayIn = document.getElementById('avg-day-in');
const avgDayOut = document.getElementById('avg-day-out');
const avgDayNet = document.getElementById('avg-day-net');
const avgWeekIn = document.getElementById('avg-week-in');
const avgWeekOut = document.getElementById('avg-week-out');
const avgWeekNet = document.getElementById('avg-week-net');

/* Use the data to add each item to the table */
function buildTable(data) {
  data.forEach(i => {
    addItem(i);
  });
}

/* First clear table rows
 * Then use the data to add each item to the table
 */
function rebuildTable(data) {
  while (detailsTbody.lastChild) {
    if(detailsTbody.lastChild.id === 'row-template') break;
    detailsTbody.removeChild(detailsTbody.lastChild);
  }
  buildTable(data);
}

/* Clear the add item input form */
function clearAddForm() {
  inputDate.value = '';
  inputCategory.value = '';
  inputName.value = '';
  inputIncome.value = 0;
  inputExpense.value = 0;
}

/* Read the add item input form
 * Returns an [item] object
 */
function readAddForm() {
  return {
    date: inputDate.value,
    category: inputCategory.value,
    name: inputName.value,
    income: inputIncome.value ? parseFloat(inputIncome.value) : 0,
    expense: inputExpense.value ? parseFloat(inputExpense.value) : 0
  };
}

/* When the add item submit button is clicked
 * Create a row in the details table for an item object
 */
function addItem(data) {
  let clone = rowTemplate.content.cloneNode(true);
  clone.querySelector('tr').id = 'newest-node';
  detailsTbody.appendChild(clone);

  let node = detailsTbody.querySelector('#newest-node');

  let dateString = dateDashToSlash(data.date);
  if(dateString === '//') dateString = '';
  node.querySelector('.date-text').textContent = dateString;
  node.querySelector('.category-text').textContent = data.category;
  node.querySelector('.name-text').textContent = data.name;
  if(data.income > 0)
    node.querySelector('.income-text').textContent = data.income;
  if(data.expense > 0)
    node.querySelector('.expense-text').textContent = data.expense;

  let editButton = node.querySelector('.edit-button');
  let saveButton = node.querySelector('.save-button');
  let deleteButton = node.querySelector('.delete-button');

  editButton.addEventListener('click', () => {
    editItem(node, data);
  });
  editButton.addEventListener('touchstart', () => {
    editItem(node, data);
  });

  saveButton.addEventListener('click', () => {
    saveItem(node, data);
  });
  saveButton.addEventListener('touchstart', () => {
    saveItem(node, data);
  });

  deleteButton.addEventListener('click', () => {
    if(confirm('Delete this item?')) deleteItem(node, data);
  });
  deleteButton.addEventListener('touchstart', () => {
    if(confirm('Delete this item?')) deleteItem(node, data);
  });

  node.id = '';
}

/* When the edit button is clicked
 * Toggle text to edit form
 */
function editItem(node, data) {
  toggleEditSave(node);

  itemFields.forEach(f => {
    node.querySelector('.'+f+'-edit').value = node.querySelector('.'+f+'-text').textContent;
  });

  node.querySelector('.date-edit').value = dateSlashToDash(node.querySelector('.date-text').textContent);
}

/* When the save button is clicked
 * Toggle edit form to text
 */
function saveItem(node, data) {
  toggleEditSave(node);

  itemFields.forEach(f => {
    node.querySelector('.'+f+'-text').textContent = node.querySelector('.'+f+'-edit').value;
  });

  let dateString = dateDashToSlash(node.querySelector('.date-edit').value);
  node.querySelector('.date-text').textContent = (dateString === '//') ? '' : dateString;

  updateStats();
}

/* When delete order is confirmed
 * Remove row from table
 */
function deleteItem(node, data) {
  detailsTbody.removeChild(node);
  updateStats();
}

/* Update in appropriate fields:
 * Net change, total income and total expenses
 * First day, number of days
 */
function updateStats() {
  // calculate total income, update text
  let incomeValues = detailsTable.querySelectorAll('.income-text');
  let totalIncome = 0;
  incomeValues.forEach(n => {
    if(n.textContent)
      totalIncome += parseFloat(n.textContent);
  });
  totalIncome = roundToCent(totalIncome);
  totalIn.textContent = totalIncome;

  // calculate total expense, update text
  let expenseValues = detailsTable.querySelectorAll('.expense-text');
  let totalExpense = 0;
  expenseValues.forEach(n => {
    if(n.textContent)
      totalExpense += parseFloat(n.textContent);
  });
  totalExpense = roundToCent(totalExpense);
  totalOut.textContent = totalExpense;

  // calculate total change, update text
  let netChange = roundToCent(totalIncome - totalExpense)
  totalChange.textContent = netChange;

  // calculate first day and number of days, update text
  let dates = detailsTable.querySelectorAll('.date-text');
  let first = (new Date()).toJSON().substring(0, 10);
  let today = (new Date()).toJSON().substring(0, 10);
  let diff = 1;
  dates.forEach(d => {
    if(d.textContent) {
      let t1 = new Date(dateSlashToDash(d.textContent));
      let t2 = new Date(today);
      if((t2.getTime() - t1.getTime()) / MS_IN_DAY > diff) {
        first = t1.toJSON().substring(0, 10);
        diff = (t2.getTime() - t1.getTime()) / MS_IN_DAY;
      }
    }
  });
  firstDay.textContent = dateDashToSlash(first);
  totalDays.textContent = diff + 1;

  // update stats section
  avgDayIn.textContent = roundToCent(totalIncome / (diff + 1));
  avgDayOut.textContent = roundToCent(totalExpense / (diff + 1));
  avgDayNet.textContent = roundToCent(netChange / (diff + 1));
  avgWeekIn.textContent = roundToCent(totalIncome / (diff + 1) * 7);
  avgWeekOut.textContent = roundToCent(totalExpense / (diff + 1) * 7);
  avgWeekNet.textContent = roundToCent(netChange / (diff + 1) * 7);
}

/* Toggles between the edit and save buttons
 * Reveals/hides the text/edit forms
 */
function toggleEditSave(node) {
  node.querySelector('.edit-button').classList.toggle('hidden');
  node.querySelector('.save-button').classList.toggle('hidden');

  itemFields.forEach(f => {
    node.querySelector('.'+f+'-text').classList.toggle('hidden');
    node.querySelector('.'+f+'-edit').classList.toggle('hidden');
  });
}

/* Converts mm/dd/yyyy to yyyy-mm-dd */
function dateSlashToDash(dateString) {
  return dateString.substring(6, 10) + '-' +
         dateString.substring(0, 2) + '-' +
         dateString.substring(3, 5);
}

/* Converts yyyy-mm-dd to mm/dd/yyyy */
function dateDashToSlash(dateString) {
  return dateString.substring(5, 7) + '/' +
         dateString.substring(8, 10) + '/' +
         dateString.substring(0, 4);
}

/* Round to the nearest cent (2 decimal places) */
function roundToCent(n) {
  return Math.round(n*100)/100;
}

//----------------------------------------------------------------------------
// test data
const data = [
  {
    date: '2018-08-11',
    category: 'Food',
    name: 'Ice cream',
    income: 0,
    expense: 100
  },
  {
    date: '2018-08-07',
    category: 'Fun',
    name: 'Dog',
    income: 0,
    expense: 1000
  },
  {
    date: '2018-08-05',
    category: 'Income',
    name: 'Payday',
    income: 1000,
    expense: 0
  },
  {
    date: '2018-08-04',
    category: 'Living Expenses',
    name: 'Rent',
    income: 0,
    expense: 600
  },
  {
    date: '2018-08-01',
    category: 'Income',
    name: 'Gift',
    income: 200,
    expense: 0
  }
];

buildTable(data);
updateStats();

/* When add form is submitted
 * Add item to table and firestore
 */
inputForm.addEventListener('submit', event => {
  event.preventDefault();
  let newItem = readAddForm();
  addItem(newItem);
  inputForm.classList.add('hidden');
  updateStats();
});

/* When add button is clicked
 * Display the add item form
 */
addButton.addEventListener('click', () => {
  inputForm.classList.toggle('hidden');
  clearAddForm();
  document.getElementById('date-input').value = (new Date()).toJSON().substring(0, 10);
});
addButton.addEventListener('touchstart', () => {
  inputForm.classList.toggle('hidden');
  clearAddForm();
  document.getElementById('date-input').value = (new Date()).toJSON().substring(0, 10);
});

/* When cancel button is clicked
 * Hide the add item form
 */
cancelButton.addEventListener('click', () => {
  inputForm.classList.add('hidden');
});
cancelButton.addEventListener('touchstart', () => {
  inputForm.classList.add('hidden');
});
