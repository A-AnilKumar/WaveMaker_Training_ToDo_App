document.addEventListener('DOMContentLoaded', function () {
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

    console.log(typeof todoName);


    if (!todoName.trim()) {
        alert("ToDo name cannot be empty");
        return;
    }

    if(!priority){
        alert("Priority cannot be empty")
        return;
    }

    if (endTime === '') {
        alert("ToDo end time cannot be empty");
        return;
    }
    
    if (endDate === '') {
        alert("ToDo end date cannot be empty");
        return;
    }

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    if (endDate < currentDate || (endDate === currentDate && endTime < currentTime)) {
        alert("Date and time should be in the future, not in the past.");
        return;
    }

    const todo = {
        text: todoName.trim(),
        priority: priority,
        endDate: endDate,
        endTime: endTime
    };

    createTodoElement(todo);
    updateLocalStorage();
    document.getElementById('todoInput').value = '';
    document.getElementById('prioritySelect').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('endDate').value = '';
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
        <!-- <span> <button class="edit-btn btn-primary col-md-1 mx-1 ">✏️</button> </span> -->
        <button class="edit-btn btn-primary col-md-1 mx-1 rounded-pill">✏️</button>
        <button class="delete-btn btn-light  col-md-1 mx-1 rounded-pill">❌</button>           
        <button class="task-completed-btn btn btn-success col-md-1 rounded-pill">✅</button>
        
    `;
    todoList.appendChild(item);
}

function handleTodoActions(event) {
    if (event.target.classList.contains('edit-btn')) {
        showEditDialog(event.target.parentElement);
    } else if (event.target.classList.contains('delete-btn')) {
        deleteTodoItem(event.target.parentElement);
    } else if (event.target.classList.contains('task-completed-btn')) {
        completeTodoItem(event.target.parentElement);
    }
}

function showEditDialog(todoItem) {
    // overlay to darken the background
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    document.body.appendChild(overlay);
    // Create the dialog box
    const dialog = document.createElement('div');
    dialog.className = 'edit-dialog';
    dialog.innerHTML = `
    <div class="dialog-content">
    <h2> Edit ToDo</h2>
        <input type="text" id="editTodoInput" value="${todoItem.querySelector('.todo-text').textContent}"> 
        <br><br>
        <select id="editPrioritySelect">
            <option value="Low" ${todoItem.querySelector('.todo-priority').textContent === 'Low' ? 'selected' : ''}>Low</option>
            <option value="Medium" ${todoItem.querySelector('.todo-priority').textContent === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="High" ${todoItem.querySelector('.todo-priority').textContent === 'High' ? 'selected' : ''}>High</option>
        </select>  
        <br> <br>
        <input type="time" id="editEndTime" value="${todoItem.querySelector('.todo-end-time').textContent}">
        <br><br>
        <input type="date" id="editEndDate" value="${todoItem.querySelector('.todo-end-date').textContent}">
        <br><br>
        <button id="saveEditBtn" class="btn btn-success">Save</button>
        <button id="cancelEditBtn" class="btn btn-danger">Cancel</button>
    </div>
`;
    document.body.appendChild(dialog);

    // Get current date and time
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const timeString = today.toTimeString().split(' ')[0].substring(0, 5);

    // minimum values to prevent selecting past date or time
    const editEndDate = document.getElementById('editEndDate');
    const editEndTime = document.getElementById('editEndTime');

    editEndDate.setAttribute('min', dateString);
    editEndTime.setAttribute('min', timeString);

    // Handle Save and Cancel actions
    document.getElementById('saveEditBtn').addEventListener('click', () => {
        // Get the selected date and time
        const selectedDate = editEndDate.value;
        const selectedTime = editEndTime.value;

        // Get the current date and time for comparison
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

        if (!selectedDate) {
            alert("Date cannot be empty");
            return;
        }

        if (selectedDate < currentDate || (selectedDate === currentDate && selectedTime < currentTime)) {
            alert('You cannot select a past date or time. Please choose a valid future date and time.');
            return;
        }

        saveTodoEdit(todoItem);
        overlay.remove();
        dialog.remove();
    });

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        overlay.remove();
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

function completeTodoItem(todoItem) {
    // todoItem.querySelector('.todo-text').style.textDecoration = 'line-through';

    // Move the item to the completed todos list
    const completedTodosList = document.getElementById('completedTodos').querySelector('ul');
    completedTodosList.appendChild(todoItem);

    // to disable the buttons 
    todoItem.querySelector('.edit-btn').disabled = true;
    todoItem.querySelector('.task-completed-btn').disabled = true;
    todoItem.querySelector('.delete-btn').disabled = true;

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
let darkMode = false;
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
        let firstValue, secondValue;
        if (criteria == 'End Date' || criteria === 'End Time') {
            // Combine date and time for comparison
            firstValue = new Date(`${a.querySelector('.todo-end-date').textContent}T${a.querySelector('.todo-end-time').textContent}`);
            secondValue = new Date(`${b.querySelector('.todo-end-date').textContent}T${b.querySelector('.todo-end-time').textContent}`);
        } else {
            // sort by priority
            const priorities = { 'High': 1, 'Medium': 2, 'Low': 3 };
            firstValue = priorities[a.querySelector('.todo-priority').textContent];
            secondValue = priorities[b.querySelector('.todo-priority').textContent];
        }
        return firstValue - secondValue;
    });
    items.forEach(item => todoList.appendChild(item));
    document.getElementById('sortBy').value = '';
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
    reader.onload = function (e) {
        const todos = JSON.parse(e.target.result);
        localStorage.setItem('todos', JSON.stringify(todos));
        loadTodos();
    };
    reader.readAsText(file);
}
