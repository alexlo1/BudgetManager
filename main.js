const itemFields = ['date', 'category', 'name', 'income', 'expense'];

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
    addItem(doc.data());
  });
  updateTotals();
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

/* Set up initial totals and stats with data in firestore */
function initializeGlobals() {

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

/* Edits an item object in the items collection in firestore */
function editItemInFirestore(node, data) {
  //let node = document.getElementById(JSON.stringify(data));
  userRef.collection('items')
    .where('date', '==', data.date)
    .where('category', '==', data.category)
    .where('name', '==', data.name)
    .where('income', '==', data.income)
    .where('expense', '==', data.expense)
    .get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        let incomeString = node.querySelector('.income-edit').value;
        let expenseString = node.querySelector('.expense-edit').value;
        doc.ref.update({
          date: node.querySelector('.date-edit').value,
          category: node.querySelector('.category-edit').value,
          name: node.querySelector('.name-edit').value,
          income: incomeString ? parseFloat(incomeString) : 0,
          expense: expenseString ? parseFloat(expenseString) : 0
        });
      });
    });
}

/* Deletes an item object from the items collection in firestore */
function deleteItemFromFirestore(data) {
  userRef.collection('items')
    .where('date', '==', data.date)
    .where('category', '==', data.category)
    .where('name', '==', data.name)
    .where('income', '==', data.income)
    .where('expense', '==', data.expense)
    .get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        doc.ref.delete();
      });
  });
}

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

  saveButton.addEventListener('click', () => {
    saveItem(node, data);
  });

  deleteButton.addEventListener('click', () => {
    if(confirm('Delete this item?')) deleteItem(node, data);
  });

  node.id = '';
}

function editItem(node, data) {
  toggleEditSave(node);

  itemFields.forEach(f => {
    node.querySelector('.'+f+'-edit').value = node.querySelector('.'+f+'-text').textContent;
  });

  node.querySelector('.date-edit').value = dateSlashToDash(node.querySelector('.date-text').textContent);
}

function saveItem(node, data) {
  toggleEditSave(node);

  itemFields.forEach(f => {
    node.querySelector('.'+f+'-text').textContent = node.querySelector('.'+f+'-edit').value;
  });

  let dateString = dateDashToSlash(node.querySelector('.date-edit').value);
  node.querySelector('.date-text').textContent = (dateString === '//') ? '' : dateString;

  editItemInFirestore(node, data);
  updateTotals();
}

function deleteItem(node, data) {
  detailsTbody.removeChild(node);
  deleteItemFromFirestore(data);
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

//----------------------------------------------------------------------------

userRef.collection('items').orderBy('date').get().then(querySnapshot => {
  rebuildTable(querySnapshot);
  querySnapshot.forEach(doc => {
    // console.log("Document data:", doc.data());
  });
});

userRef.get().then(doc => {
  if (doc.exists) {
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
  addItem(newItem);
  addItemToFirestore(newItem);
  inputForm.classList.add('hidden');
  updateTotals();
});

addButton.addEventListener('click', () => {
  inputForm.classList.toggle('hidden');
  clearAddForm();
  let d = new Date();
  document.getElementById('date-input').value = d.toJSON().substring(0, 10);
});

cancelButton.addEventListener('click', () => {
  inputForm.classList.add('hidden');
});
