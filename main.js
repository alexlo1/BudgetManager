const detailsTable = document.getElementById('details-table');
const detailsTbody = document.getElementById('details-tbody');
const rowTemplate = document.getElementById('row-template');

const totalIn = document.getElementById('total-in');
const totalOut = document.getElementById('total-out');
const totalChange = document.getElementById('total-change');

const inputForm = document.getElementById('input-form');
const inputDate = document.getElementById('date-input');
const inputCategory = document.getElementById('category-input');
const inputName = document.getElementById('name-input');
const inputIncome = document.getElementById('income-input');
const inputExpense = document.getElementById('expense-input');

const addButton = document.getElementById('add-button');
const submitButton = document.getElementById('submit-input');
const cancelButton = document.getElementById('cancel-input');

const testUserRef = firestore.collection('users').doc('testuser');
const userRef = testUserRef;

/* Uses the firebase data snapshot to add each item to the table */
function buildTable(snapshot) {
  snapshot.forEach(doc => {
    addItemRow(doc.data());
  });
}

/* First clears table rows
 * Then uses the firebase data snapshot to add each item to the table
 */
function rebuildTable(snapshot) {
  while (detailsTbody.lastChild) {
    if(detailsTbody.lastChild.id === 'row-template') break;
    detailsTbody.removeChild(detailsTbody.lastChild);
  }
  buildTable(snapshot);
}

/* Clears the add item input form */
function clearAddForm() {
  inputDate.value = '';
  inputCategory.value = '';
  inputName.value = '';
  inputIncome.value = 0;
  inputExpense.value = 0;
}

/* Reads the add item input form
 * Returns an [item] object
 */
function readAddForm() {
  return {
    date: inputDate.value,
    category: inputCategory.value,
    name: inputName.value,
    income: inputIncome.value,
    expense: inputExpense.value,
  };
}

/* Adds an item object to the items collection in firestore */
function addItemToFirestore(data) {
  userRef.collection('items').add(data);
}

function addItemRow(data) {
  console.log('added!');
  let clone = rowTemplate.content.cloneNode(true);
  clone.querySelector('tr').id = 'newest-node';
  detailsTbody.appendChild(clone);

  let node = detailsTbody.querySelector('#newest-node');

  let dateString = data.date.substring(5, 7) + '/' +
                   data.date.substring(8, 10) + '/' +
                   data.date.substring(0, 4);
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
    console.log('edited!');
    editButton.classList.toggle('hidden');
    saveButton.classList.toggle('hidden');

    node.querySelector('.date-text').classList.add('hidden');
    node.querySelector('.category-text').classList.add('hidden');
    node.querySelector('.name-text').classList.add('hidden');
    node.querySelector('.income-text').classList.add('hidden');
    node.querySelector('.expense-text').classList.add('hidden');

    let dateString = node.querySelector('.date-text').textContent.substring(6, 10) + '-' +
                     node.querySelector('.date-text').textContent.substring(0, 2) + '-' +
                     node.querySelector('.date-text').textContent.substring(3, 5);
    node.querySelector('.date-edit').value = dateString;
    node.querySelector('.category-edit').value = node.querySelector('.category-text').textContent;
    node.querySelector('.name-edit').value = node.querySelector('.name-text').textContent;
    node.querySelector('.income-edit').value = node.querySelector('.income-text').textContent;
    node.querySelector('.expense-edit').value = node.querySelector('.expense-text').textContent;

    node.querySelector('.date-edit').classList.remove('hidden');
    node.querySelector('.category-edit').classList.remove('hidden');
    node.querySelector('.name-edit').classList.remove('hidden');
    node.querySelector('.income-edit').classList.remove('hidden');
    node.querySelector('.expense-edit').classList.remove('hidden');
  });

  saveButton.addEventListener('click', () => {
    console.log('saved!');
    saveButton.classList.toggle('hidden');
    editButton.classList.toggle('hidden');

    node.querySelector('.date-edit').classList.add('hidden');
    node.querySelector('.category-edit').classList.add('hidden');
    node.querySelector('.name-edit').classList.add('hidden');
    node.querySelector('.income-edit').classList.add('hidden');
    node.querySelector('.expense-edit').classList.add('hidden');

    let dateString = node.querySelector('.date-edit').value.substring(5, 7) + '/' +
                     node.querySelector('.date-edit').value.substring(8, 10) + '/' +
                     node.querySelector('.date-edit').value.substring(0, 4);
    if(dateString === '//') dateString = '';
    node.querySelector('.date-text').textContent = dateString;
    node.querySelector('.category-text').textContent = node.querySelector('.category-edit').value;
    node.querySelector('.name-text').textContent = node.querySelector('.name-edit').value;
    node.querySelector('.income-text').textContent = node.querySelector('.income-edit').value;
    node.querySelector('.expense-text').textContent = node.querySelector('.expense-edit').value;

    node.querySelector('.date-text').classList.remove('hidden');
    node.querySelector('.category-text').classList.remove('hidden');
    node.querySelector('.name-text').classList.remove('hidden');
    node.querySelector('.income-text').classList.remove('hidden');
    node.querySelector('.expense-text').classList.remove('hidden');

    updateTotals();
  });

  deleteButton.addEventListener('click', () => {
    if(confirm('Delete this item?')) {
      console.log('deleted!');
      detailsTbody.removeChild(node);
    }
  });

  node.id = '';

  updateTotals();
}

function updateTotals() {
  let incomeValues = detailsTable.querySelectorAll('.income-text');
  let totalIncome = 0;
  incomeValues.forEach(n => {
    if(n.textContent)
      totalIncome += parseFloat(n.textContent);
  });
  totalIn.textContent = totalIncome;
  userRef.update({ totalIncome: totalIncome });

  let expenseValues = detailsTable.querySelectorAll('.expense-text');
  let totalExpense = 0;
  expenseValues.forEach(n => {
    if(n.textContent)
      totalExpense += parseFloat(n.textContent);
  });
  totalOut.textContent = totalExpense;
  userRef.update({ totalExpense: totalExpense });

  totalChange.textContent = totalIncome - totalExpense;
  userRef.update({ totalChange: totalIncome - totalExpense });
}

//----------------------------------------------------------------------------

userRef.collection('items').orderBy('date').get().then(querySnapshot => {
  rebuildTable(querySnapshot);
  querySnapshot.forEach(doc => {
    console.log("Document data:", doc.data());
  });
});

userRef.get().then(doc => {
  if (doc.exists) {
    console.log("Document data:", doc.data());
    totalIn.textContent = doc.data().totalIncome;
    totalOut.textContent = doc.data().totalExpense;
    totalChange.textContent = doc.data().totalIncome - doc.data().totalExpense;
  } else {
    console.log("No such document!");
  }
}).catch(err => {
  console.log("Error getting document:", error);
});

inputForm.addEventListener('submit', event => {
  event.preventDefault();
  let newItem = readAddForm();
  addItemRow(newItem);
  addItemToFirestore(newItem);
  inputForm.classList.add('hidden');
  clearAddForm();
});

addButton.addEventListener('click', () => {
  inputForm.classList.toggle('hidden');
  clearAddForm();
  let d = new Date();
  document.getElementById('date-input').value = d.toJSON().substring(0, 10);
});

cancelButton.addEventListener('click', () => {
  inputForm.classList.add('hidden');
  clearAddForm();
});

let d = new Date();
document.getElementById('date-input').value = d.toJSON().substring(0, 10);
