document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const timeString = today.toTimeString().split(' ')[0].substring(0, 5);
    document.getElementById('endDate').setAttribute('min', dateString);
    document.getElementById('endTime').setAttribute('min', timeString);

    document.getElementById('addTodoButton').addEventListener('click', addTodo);
    document.getElementById('exportBtn').addEventListener('click', exportTodos);
    document.getElementById('importFile').addEventListener('change', importTodos);

    document.getElementById('todoList').addEventListener('click', handleTodoActions);
    document.getElementById('sortBy').addEventListener('change', sortTodos);

    loadTodos();
});

function addTodo() {
    const todoName = document.getElementById('todoInput').value;
    const priority = document.getElementById('prioritySelect').value;
    const endTime = document.getElementById('endTime').value;
    const endDate = document.getElementById('endDate').value;

    if (todoName === '') return;

    const todo = {
        text: todoName,
        priority: priority,
        endDate: endDate,
        endTime: endTime
    };

    createTodoElement(todo);
    updateLocalStorage();
    document.getElementById('todoInput').value = '';
}

function createTodoElement(todo) {
    const todoList = document.getElementById('todoList');
    const item = document.createElement('li');
    item.className = 'todo-item border m-1';
    item.draggable = true;

    item.innerHTML = `
        <span class="todo-text col-md-3 mx-4">${todo.text}</span>
        <span class="todo-priority col-md-1 mx-4">${todo.priority}</span>
        <span class="todo-end-date col-md-2 mx-4">${todo.endDate}</span>
        <span class="todo-end-time wk.col-md-1 mx-4">${todo.endTime}</span>
    <!--  <button class="edit-btn col-md-1 mx-1 rounded-pill">✏️</button>
        <button class="delete-btn col-md-1 mx-1 rounded-pill">❌</button>           -->
        <button class="edit-btn btn btn-secondary col-md-1 mx-4">Edit</button>
        <button class="delete-btn btn btn-danger col-md-1">Delete</button>
    `;
    todoList.appendChild(item);
}

function handleTodoActions(event) {
    if (event.target.classList.contains('edit-btn')) {
        showEditDialog(event.target.parentElement);
    } else if (event.target.classList.contains('delete-btn')) {
        deleteTodoItem(event.target.parentElement);
    }
}

function showEditDialog(todoItem) {
    const dialog = document.createElement('div');
    dialog.className = 'edit-dialog';
    dialog.innerHTML = `
        <dialog open>
            <input type="text" id="editTodoInput" value="${todoItem.querySelector('.todo-text').textContent}">
            <select id="editPrioritySelect">
                <option value="Low" ${todoItem.querySelector('.todo-priority').textContent === 'Low' ? 'selected' : ''}>Low</option>
                <option value="Medium" ${todoItem.querySelector('.todo-priority').textContent === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="High" ${todoItem.querySelector('.todo-priority').textContent === 'High' ? 'selected' : ''}>High</option>
            </select>
            <input type="time" id="editEndTime" value="${todoItem.querySelector('.todo-end-time').textContent}">
            <input type="date" id="editEndDate" value="${todoItem.querySelector('.todo-end-date').textContent}">
            <button id="saveEditBtn" class="btn btn-success">Save</button>
            <button id="cancelEditBtn" class="btn btn-danger">Cancel</button>
        </dialog>
    `;
    document.body.appendChild(dialog);

    document.getElementById('saveEditBtn').addEventListener('click', () => {
        saveTodoEdit(todoItem);
        dialog.remove();
    });
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        dialog.remove();
    });
}

function saveTodoEdit(todoItem) {
    const text = document.getElementById('editTodoInput').value;
    const priority = document.getElementById('editPrioritySelect').value;
    const endTime = document.getElementById('editEndTime').value;
    const endDate = document.getElementById('editEndDate').value;

    todoItem.querySelector('.todo-text').textContent = text;
    todoItem.querySelector('.todo-priority').textContent = priority;
    todoItem.querySelector('.todo-end-time').textContent = endTime;
    todoItem.querySelector('.todo-end-date').textContent = endDate;

    updateLocalStorage();
}

function deleteTodoItem(todoItem) {
    todoItem.remove();
    updateLocalStorage();
}

searchBar.addEventListener('input', () => {
        const searchTerm = searchBar.value.toLowerCase();
        const todos = todoList.querySelectorAll('.todo-item');
        todos.forEach(todo => {
            const text = todo.querySelector('span').textContent.toLowerCase();
            todo.style.display = text.includes(searchTerm) ? 'flex' : 'none';
        });
    });

const darkModeToggle = document.getElementById('darkModeToggle');
let darkMode  = false;
    darkModeToggle.addEventListener('click', () => {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
        darkModeToggle.textContent = darkMode ? '🌞' : '🌙';
    });

function updateLocalStorage() {
    const todos = Array.from(document.querySelectorAll('.todo-item')).map(item => ({
        text: item.querySelector('.todo-text').textContent,
        priority: item.querySelector('.todo-priority').textContent,
        endDate: item.querySelector('.todo-end-date').textContent,
        endTime: item.querySelector('.todo-end-time').textContent
    }));
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.forEach(todo => createTodoElement(todo));
}

function sortTodos() {
    const criteria = document.getElementById('sortBy').value;
    const todoList = document.getElementById('todoList');
    const items = Array.from(todoList.getElementsByClassName('todo-item'));
    items.sort((a, b) => {
        let  firstValue,  secondValue;
        if(criteria == 'End Date'){
            firstValue = new Date(a.querySelector('.todo-end-date').textContent);
            secondValue = new Date(b.querySelector('.todo-end-date').textContent)
        }
        else if(criteria == 'End Time'){
            firstValue = parseTime(a.querySelector('.todo-end-time').textContent);
            secondValue = parseTime(b.querySelector('.todo-end-time').textContent);
        }
        else{
            // need to implement more 
            const priorities = { 'High': 1, 'Medium': 2, 'Low': 3 };
            firstValue = priorities[a.querySelector('.todo-priority').textContent];
            secondValue = priorities[b.querySelector('.todo-priority').textContent];
        }
        return  firstValue -  secondValue;
    });
    items.forEach(item => todoList.appendChild(item));
}

function parseTime(timeString) {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) {
        hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
        hours = 0;
    }
    return hours * 60 + minutes;
}

function exportTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const json = JSON.stringify(todos, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todos.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importTodos(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const todos = JSON.parse(e.target.result);
        localStorage.setItem('todos', JSON.stringify(todos));
        loadTodos();
    };
    reader.readAsText(file);
}
