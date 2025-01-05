document.addEventListener('DOMContentLoaded', () => {
    const columns = {
        'todo': document.getElementById('todo').querySelector('.task-list'),
        'in-progress': document.getElementById('in-progress').querySelector('.task-list'),
        'done': document.getElementById('done').querySelector('.task-list')
    };

    const modal = document.getElementById('task-modal');
    const addTaskButtons = document.querySelectorAll('.add-task-btn');
    const closeModalBtn = document.querySelector('.close-btn');
    const taskInput = document.getElementById('task-input');
    const taskPriority = document.getElementById('task-priority');
    const taskDueDate = document.getElementById('task-due-date');
    const saveTaskBtn = document.getElementById('save-task-btn');
    let currentColumn = null;

    // Load tasks from local storage
    function loadTasks() {
        Object.keys(columns).forEach(columnName => {
            const storedTasks = JSON.parse(localStorage.getItem(columnName) || '[]');
            columns[columnName].innerHTML = ''; // Clear existing tasks
            storedTasks.forEach(task => createTask(task.text, columnName, task.priority, task.dueDate));
        });
    }

    // Save tasks to local storage
    function saveTasks(column) {
        const tasks = Array.from(column.children).map(task => ({
            text: task.querySelector('.task-text').textContent,
            priority: task.dataset.priority || 'medium',
            dueDate: task.dataset.dueDate || ''
        }));
        localStorage.setItem(column.closest('.board-column').id, JSON.stringify(tasks));
    }

    // Create a new task
    function createTask(taskText, columnName = 'todo', priority = 'medium', dueDate = '') {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task');
        taskElement.dataset.priority = priority;
        if (dueDate) taskElement.dataset.dueDate = dueDate;

        taskElement.innerHTML = `
            <div class="task-content">
                <span class="task-text">${taskText}</span>
                ${dueDate ? `<span class="task-due-date">Due: ${dueDate}</span>` : ''}
                <span class="task-priority ${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority</span>
            </div>
            <div class="task-actions">
                <button class="edit-task">✏️</button>
                <button class="move-task">➡️</button>
                <button class="delete-task">🗑️</button>
            </div>
        `;

        // Edit task functionality
        taskElement.querySelector('.edit-task').addEventListener('click', () => {
            const currentText = taskElement.querySelector('.task-text').textContent;
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = currentText;
            editInput.classList.add('edit-input');

            const taskTextSpan = taskElement.querySelector('.task-text');
            taskTextSpan.innerHTML = '';
            taskTextSpan.appendChild(editInput);
            editInput.focus();

            editInput.addEventListener('blur', () => {
                const newText = editInput.value.trim();
                if (newText) {
                    taskTextSpan.textContent = newText;
                    const columnElement = taskElement.closest('.board-column');
                    saveTasks(columnElement.querySelector('.task-list'));
                } else {
                    taskTextSpan.textContent = currentText;
                }
            });

            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    editInput.blur();
                }
            });
        });

        // Move task between columns
        taskElement.querySelector('.move-task').addEventListener('click', () => {
            const currentColumnElement = taskElement.closest('.board-column');
            const columnOrder = ['todo', 'in-progress', 'done'];
            const currentIndex = columnOrder.indexOf(currentColumnElement.id);
            
            if (currentIndex < columnOrder.length - 1) {
                const nextColumn = columns[columnOrder[currentIndex + 1]];
                nextColumn.appendChild(taskElement);
                saveTasks(currentColumnElement.querySelector('.task-list'));
                saveTasks(nextColumn);
            }
        });

        // Delete task
        taskElement.querySelector('.delete-task').addEventListener('click', () => {
            const columnElement = taskElement.closest('.board-column');
            taskElement.remove();
            saveTasks(columnElement.querySelector('.task-list'));
        });

        columns[columnName].appendChild(taskElement);
        saveTasks(columns[columnName]);
    }

    // Open modal to add task
    addTaskButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentColumn = btn.closest('.board-column').id;
            modal.style.display = 'block';
            taskInput.value = '';
            taskInput.focus();
        });
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Save new task
    saveTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const priority = taskPriority.value;
        const dueDate = taskDueDate.value;
        if (taskText) {
            createTask(taskText, currentColumn, priority, dueDate);
            modal.style.display = 'none';
        }
    });

    // Allow enter key to save task
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveTaskBtn.click();
        }
    });

    // Close modal if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initial load of tasks
    loadTasks();
});
