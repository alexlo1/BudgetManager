const inputForm = document.getElementById('input-form');
const inputDate = document.getElementById('date-input');
const inputCategory = document.getElementById('category-input');
const inputName = document.getElementById('name-input');
const inputIncome = document.getElementById('income-input');
const inputExpense = document.getElementById('expense-input');

const addButton = document.getElementById('add-button');
const submitButton = document.getElementById('submit-input');
const cancelButton = document.getElementById('cancel-input');

function buildTable(data) {
  data.forEach(i => {
    addItem(i);
  });
}

function clearForm() {
  inputDate.value = '';
  inputCategory.value = '';
  inputName.value = '';
  inputIncome.value = 0;
  inputExpense.value = 0;
}

function readForm() {
  return {
    date: inputDate.value,
    category: inputCategory.value,
    name: inputName.value,
    income: inputIncome.value,
    expense: inputExpense.value,
  };
}

function addItem(data) {
  console.log('added!');
  let temp = document.getElementById('row-template');
  let tbody = document.querySelector('#details-table > tbody');
  let clone = temp.content.cloneNode(true);
  clone.querySelector('tr').id = 'newest-node';
  tbody.appendChild(clone);

  let node = tbody.querySelector('#newest-node');

  let dateString = data.date.substring(5, 7) + '/' +
                   data.date.substring(8, 10) + '/' +
                   data.date.substring(2, 4);
  node.querySelector('.date-col').textContent = dateString;

  node.querySelector('.category-col').textContent = data.category;

  node.querySelector('.name-col').textContent = data.name;

  if(data.income > 0)
    node.querySelector('.income-col').textContent = data.income;

  if(data.expense > 0)
    node.querySelector('.expense-col').textContent = data.expense;

  let editButton = node.querySelector('.edit-button');
  let saveButton = node.querySelector('.save-button');
  let deleteButton = node.querySelector('.delete-button');

  editButton.addEventListener('click', () => {
    console.log('edited!');
    editButton.classList.toggle('hidden');
    saveButton.classList.toggle('hidden');
  });

  saveButton.addEventListener('click', () => {
    console.log('saved!');
    saveButton.classList.toggle('hidden');
    editButton.classList.toggle('hidden');
  });

  deleteButton.addEventListener('click', () => {
    if(confirm('Delete this item?')) {
      console.log('deleted!');
      tbody.removeChild(node);
    }
  });

  node.id = '';
}

//----------------------------------------------------------------------------

const data = [
  {
    date: '2018-08-07',
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
];

buildTable(data);

inputForm.addEventListener('submit', event => {
  event.preventDefault();
  addItem(readForm());
  inputForm.classList.add('hidden');
  clearForm();
});

addButton.addEventListener('click', () => {
  inputForm.classList.toggle('hidden');
  clearForm();
});

cancelButton.addEventListener('click', () => {
  inputForm.classList.add('hidden');
  clearForm();
});
