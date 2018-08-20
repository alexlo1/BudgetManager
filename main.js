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

/* Uses the firebase data snapshot to add each item to the table */
function buildTable(snapshot) {
  snapshot.forEach(doc => {
    addItem(doc.data());
  });
  updateStats();
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
    income: inputIncome.value ? parseFloat(inputIncome.value) : 0,
    expense: inputExpense.value ? parseFloat(inputExpense.value) : 0
  };
}

/* Adds an item object to the items collection in firestore */
function addItemToFirestore(data) {
  userRef.collection('items').add(data);
}

/* Edits an item object in the items collection in firestore */
function editItemInFirestore(node, data) {
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

  saveButton.addEventListener('click', () => {
    saveItem(node, data);
  });

  deleteButton.addEventListener('click', () => {
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
 * Toggle edit form to text and update firestore
 */
function saveItem(node, data) {
  toggleEditSave(node);

  itemFields.forEach(f => {
    node.querySelector('.'+f+'-text').textContent = node.querySelector('.'+f+'-edit').value;
  });

  let dateString = dateDashToSlash(node.querySelector('.date-edit').value);
  node.querySelector('.date-text').textContent = (dateString === '//') ? '' : dateString;

  editItemInFirestore(node, data);
  updateStats();
}

function deleteItem(node, data) {
  detailsTbody.removeChild(node);
  deleteItemFromFirestore(data);
  updateStats();
}

/* Update in firestore:
 * Net change, total income and total expenses
 * First day, number of days
 */
function updateStats() {
  let incomeValues = detailsTable.querySelectorAll('.income-text');
  let totalIncome = 0;
  incomeValues.forEach(n => {
    if(n.textContent)
      totalIncome += parseFloat(n.textContent);
  });
  totalIncome = roundToCent(totalIncome);
  totalIn.textContent = totalIncome;
  userRef.update({ totalIncome: totalIncome });

  let expenseValues = detailsTable.querySelectorAll('.expense-text');
  let totalExpense = 0;
  expenseValues.forEach(n => {
    if(n.textContent)
      totalExpense += parseFloat(n.textContent);
  });
  totalExpense = roundToCent(totalExpense);
  totalOut.textContent = totalExpense;
  userRef.update({ totalExpense: totalExpense });

  let netChange = roundToCent(totalIncome - totalExpense)
  totalChange.textContent = netChange;
  userRef.update({ totalChange: netChange });

  // update first day/number of days
  let dates = detailsTable.querySelectorAll('.date-text');
  let first = (new Date()).toJSON().substring(0, 10);
  let diff = 1;
  dates.forEach(d => {
    if(d.textContent) {
      let t1 = new Date(dateSlashToDash(d.textContent));
      let t2 = new Date(first);
      if(t1.getTime() < t2.getTime()) {
        first = t1.toJSON().substring(0, 10);
        diff = (t2.getTime() - t1.getTime()) / MS_IN_DAY;
      }
    }
  });
  firstDay.textContent = dateDashToSlash(first);
  userRef.update({ firstDay: first });
  totalDays.textContent = diff + 1;
  userRef.update({ totalDays: diff + 1 });

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

function roundToCent(n) {
  return Math.round(n*100)/100;
}

//----------------------------------------------------------------------------
let userEmail = 'testuser';
let userRef = firestore.collection('users').doc(userEmail);

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    userEmail = user.email;
    userRef = firestore.collection('users').doc(userEmail);
    setup(userRef);
  } else {
    setup(userRef);
  }
});

function setup(userRef) {
  userRef.get().then(doc => {
    if (doc.exists) {
      totalIn.textContent = doc.data().totalIncome;
      totalOut.textContent = doc.data().totalExpense;
      totalChange.textContent = doc.data().totalIncome - doc.data().totalExpense;
      firstDay.textContent = dateDashToSlash(doc.data().firstDay);

      let first = new Date(doc.data().firstDay);
      let today = new Date();
      today = new Date(today.toJSON().substring(0, 10));

      let diff = (today.getTime() - first.getTime()) / MS_IN_DAY;
      totalDays.textContent = diff + 1;
    } else {
      userRef.set({
        totalChange: 0,
        totalIncome: 0,
        totalExpense: 0,
        firstDay: (new Date()).toJSON().substring(0, 10),
        totalDays: 1
      });
    }
  }).catch(err => {
    console.log("Error getting document:", err);
  });

  userRef.collection('items').orderBy('date').get().then(querySnapshot => {
    rebuildTable(querySnapshot);
    // querySnapshot.forEach(doc => {console.log("Document data:", doc.data());});
  });
}

inputForm.addEventListener('submit', event => {
  event.preventDefault();
  let newItem = readAddForm();
  addItem(newItem);
  addItemToFirestore(newItem);
  inputForm.classList.add('hidden');
  updateStats();
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
