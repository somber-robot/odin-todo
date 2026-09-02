import { Priority, Status } from "./logic.js";
import svgs from "./svgs.json";

const appendChildren = (parent, children) => {
    for (const child of children){
        parent.appendChild(child);
    }
};

const removeChildren = (parent, children) => {
    for (const child of children){
        parent.removeChild(child);
    }
};

export const loadPage = (logic) => {
    let selectInputs = document.querySelectorAll("select");
    let dateInputs = document.querySelectorAll("input[type='date']");

    for (const modal of document.querySelectorAll(".modal")){
        modal.addEventListener("close", () => {
            modal.classList.remove("is-open", "create", "edit");
            for (const input of document.querySelectorAll(".modal-input")){
                input.value = "";
                input.checked = false;
                input.classList.remove("required");
            }

            let select = document.querySelector(".project-dropdown");
            let remove = [];
            for (const option of select.childNodes) {
                if (option === select.firstElementChild) continue;
                remove.push(option);
            }
            for (const option of remove) option.remove();
            select.value = "";
            
            for (const select of selectInputs) select.classList.add("empty");
            for (const date of dateInputs) date.classList.add("empty"); 

        });
        modal.addEventListener("toggle", (e) => {
            if (e.newState !== "open") return;
            modal.classList.add("is-open");
        });
        modal.addEventListener("click", (event) => {
            const rect = modal.getBoundingClientRect();
            const isClickOutside = (
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom
            );
            if (isClickOutside) modal.close();
        });
    }

    for (const select of selectInputs){
        select.addEventListener("change", () => {
            select.classList.remove("empty")
        })
    }

    for (const date of dateInputs){
        date.addEventListener("change", () => {
            date.classList.remove("empty");
        });
    }

    const projectModal = document.querySelector(".project-modal");
    const projectName = document.querySelector("#project-name");
    
    for (const input of document.querySelectorAll(".modal-input")){
        input.addEventListener("input", () => {
            input.classList.remove("required");
        });
    }

    const projectSearch = document.querySelector(".search.projects");
    projectSearch.addEventListener("input", () => {
        let filter = projectSearch.value.trim().toLowerCase();
        for (const item of document.querySelectorAll(".project-item")){
            let name = item.firstElementChild.innerText;
            if (name.includes(filter)) 
                item.classList.remove("filtered");
            else
                item.classList.add("filtered");
        }
    });

    const projectConfirm = document.querySelector(".project-modal .confirm");
    projectConfirm.addEventListener("click", (e) => {
        let name = projectName.value.trim();
        if (name === ""){
            projectName.classList.add("required");
            e.stopPropagation();
            return;
        } 
        if (projectModal.classList.contains("create")){
            createProjectItem(name);
        } else 
        if (projectModal.classList.contains("edit")){
            for (const item of document.querySelectorAll(".project-item")){
                if (item.dataset.id !== logic.current) continue;
                item.firstElementChild.innerText = name;
                break;
            }
            logic.editProject(name);
            setCurrentBox(logic.getCurrentProject());
        }
        projectModal.close();
    });

    const projectList = document.querySelector(".project-list");

    const createProjectItem = (projectName) => {
        let project = logic.createProject(projectName);
        return createProjectItemUI(project);
    };

    const createProjectItemUI = (project) => {
        let projectItem = document.createElement("div");
        projectItem.classList.add("project-item");
        projectItem.dataset.id = project.id;
        let name = document.createElement("p");
        name.classList.add("name");
        name.innerText = project.name;
        let count = document.createElement("p");
        count.classList.add("todo-count");
        let todoCount = logic.getTodoCount(project.id);
        count.innerText = todoCount;

        const selectProject = () =>{
            let currentID = logic.current;
            let projectID = projectItem.dataset.id
            if (currentID === projectID) return;
            for (const item of document.querySelectorAll(".project-item")){
                if (item.dataset.id !== currentID) continue;
                item.classList.remove("selected");
                break;
            }
            logic.selectProject(projectID);
            projectItem.classList.add("selected");
            setCurrentBox(project);
            populateTodos();
        } 

        projectItem.addEventListener("click", () => {
            selectProject();
        });
        projectItem.tabIndex = 0;
        projectItem.addEventListener("keydown", (e) => {
            if (e.key != "Space" && e.key != "Enter") return;
            selectProject();
        });

        appendChildren(projectItem, [name, count]);
        projectList.appendChild(projectItem);
        
        return projectItem;
    }

    const updateCurrentCount = () => {
        let count = document.querySelector(".current-project .footer .todo-count");
        let todoCount = logic.getTodoCount(logic.current);
        count.innerText = `${todoCount} task${(todoCount == 1) ? "" : "s"}`;
        let itemCount = document.querySelector(`[data-id="${logic.current}"] .todo-count`);
        itemCount.innerText = todoCount;
    };

    const setCurrentBox = (project) => {
        let name = document.querySelector(".current-project .name");
        name.innerText = project.name;
        let date = document.querySelector(".current-project .created");
        date.innerText = `Created: ${project.created}`;
        let count = document.querySelector(".current-project .footer .todo-count");
        let todoCount = logic.getTodoCount(project.id);
        count.innerText = `${todoCount} task${(todoCount == 1) ? "" : "s"}`;
        
        let footer = document.querySelector(".current-project .footer");
        let oldEdit = document.querySelector(".current-project .footer .edit");
        let oldDel = document.querySelector(".current-project .footer .delete");
        removeChildren(footer, [oldEdit, oldDel]);

        let newEdit = document.createElement("button");
        newEdit.classList.add("edit");
        newEdit.innerHTML = svgs.edit;
        newEdit.addEventListener("click", () => {
            let heading = document.querySelector(".project-modal .heading");
            heading.innerText = "Edit Project";
            let name = document.querySelector(".project-modal #project-name");
            name.value = project.name;
            projectModal.classList.add("edit");
            projectModal.showModal();
        });

        let newDel = document.createElement("button");
        newDel.classList.add("delete");
        newDel.innerHTML = svgs.delete;
        newDel.addEventListener("click", () => {
            if (logic.projects.length === 1){
                let message = document.querySelector(".other-message");
                message.innerText = "You must have atleast one project."
                otherModal.showModal();
                return;
            }
            let name = document.querySelector(".delete-project .name");
            name.innerText = logic.getCurrentProject().name;
            deleteModal.showModal();
        });
        appendChildren(footer, [newEdit, newDel]);
    };
    
    const otherModal = document.querySelector(".other");

    for (const button of document.querySelectorAll(".just-close")){
        button.addEventListener("click", () => {
            let modal = button.closest(".modal");
            modal.close();
        });
    }

    const deleteModal = document.querySelector(".delete-project");
    const deleteConfirm = document.querySelector(".delete-project .buttons .delete");
    deleteConfirm.addEventListener("click", () => {
        let items = document.querySelectorAll(".project-item");
        for (const item of items){
            if (item.dataset.id !== logic.current) continue;
            item.remove();
            break;
        }
        logic.deleteProject(logic.current);
        for (const item of items){
            if (item.dataset.id !== logic.current) continue;
            item.classList.add("selected");
            break;
        }
        setCurrentBox(logic.getCurrentProject());
        populateTodos();
        deleteModal.close();
    });

    const todoModal = document.querySelector(".todo-modal");

    const todoSearch = document.querySelector(".search.todos");
    todoSearch.addEventListener("input", () => {
        populateTodos();
    });

    const confirmTodo = document.querySelector(".todo-modal .confirm");
    confirmTodo.addEventListener("click", (e) => {
        let name = document.querySelector("#todo-title");
        let desc = document.querySelector("#todo-description");
        let date = document.querySelector("#todo-date");
        let priority = document.querySelector("#todo-priority");

        let invalid = false;
        for (const field of [name, date, priority]){
            if (field.value.trim() !== "") continue;
            invalid = true;
            field.classList.add("required");
        }

        if (invalid) {
            e.stopPropagation();
            return;
        }
  
        if (todoModal.classList.contains("create")){
            createTodoItem(name.value.trim(), desc.value.trim(), new Date(date.value), priority.value);
            updateCurrentCount();
            populateTodos();
        } else
        if (todoModal.classList.contains("edit")){
            logic.editTodo(todoModal.dataset.editID, name.value.trim(),
                           desc.value.trim(), date.valueAsDate, priority.value);

            let id = todoModal.dataset.editID;

            let bar = document.querySelector(`[data-id='${id}'] .priority-bar`);
            bar.classList.remove("low", "mid", "high");
            bar.classList.add(priority.value);

            let title = document.querySelector(`[data-id='${id}'] .name`);
            title.innerText = name.value.trim();

            let due = document.querySelector(`[data-id='${id}'] .todo-body .header .todo-info .date`);
            due.innerText = generateTodoDateText(date.valueAsDate);

            let summary = document.querySelector(`[data-id='${id}'] .todo-body .description`);
            summary.innerText = desc.value.trim();         
            if (desc.value.trim() === ""){
                summary.innerText = "No description..."
                summary.classList.add("no-desc");
            }else
                summary.classList.remove("no-desc");
        }
        todoModal.close();
    });

    const generateTodoDateText = (dueDate) => {
        const today = new Date();
        const todoDate = new Date(dueDate);   
        const daysLeftRaw = Math.abs(today - todoDate) / (1000*60*60*24)
        const daysLeft = (today<todoDate) ? Math.ceil(daysLeftRaw) : Math.floor(daysLeftRaw); 
        if (today.getFullYear() == todoDate.getFullYear()
        && today.getMonth() == todoDate.getMonth()
        && today.getDate() == todoDate.getDate())
            return "Due today";
        else
            return `${daysLeft} day${(daysLeft==1)? "" : "s"} ${(today<todoDate) ? "left" : "ago"}`;
    }

    const createTodoItem = (title, description, date, priority) => {
        let todo = logic.createTodo(title, description, date, priority);
        if (logic.filters.includes(todo.priority) && logic.filters.includes(todo.status))
            return createTodoItemUI(todo);
    };

    const createTodoItemUI = (todo) => {
        let item = document.createElement("div");
        item.classList.add("todo-item");
        if (todo.status === Status.COMPLETE)
            item.classList.add("complete");

        item.dataset.id = todo.id;
        const expanded = logic.expandedIDs.includes(todo.id)
        if (expanded) item.classList.add("expanded");
        
        let bar = document.createElement("div");
        bar.classList.add("priority-bar", todo.priority);
        
        let body = document.createElement("div");
        body.classList.add("todo-body");
        
        let header = document.createElement("div");
        header.classList.add("header");

        let info = document.createElement("div");
        info.classList.add("todo-info");
        
        let name = document.createElement("p");
        name.classList.add("name");
        name.innerText = todo.title;

        let date = document.createElement("p");
        date.classList.add("date");
        date.innerText = generateTodoDateText(todo.due);
    
        appendChildren(info, [name, date]);

        let buttons = document.createElement("div");
        buttons.classList.add("todo-buttons");

        for (const type of ["toggle", "edit", "move", "delete"]){
            let button = document.createElement("button");
            button.classList.add(type);
            button.innerHTML = svgs[type];
            switch (type) {
                case "toggle":
                    button.addEventListener("click", () => {
                        logic.toggleTodoStatus(todo.id);
                        if (todo.status === Status.INCOMPLETE){
                            item.classList.remove("complete");
                            if (!logic.filters.includes(Status.INCOMPLETE))
                                item.remove();
                        }else{
                            item.classList.add("complete");
                            if (!logic.filters.includes(Status.COMPLETE))
                                item.remove();
                        }
                    });
                    buttons.appendChild(button);
                    break;
                case "edit":
                    button.addEventListener("click", () => {
                        todoModal.classList.add("edit");
                        todoModal.dataset.editID = todo.id;
                        let heading = document.querySelector(".todo-modal .heading");
                        heading.innerText = "Edit Task";
                        let name = document.querySelector("#todo-title");
                        name.value = todo.title;
                        let desc = document.querySelector("#todo-description");
                        desc.value = todo.description;
                        let date = document.querySelector("#todo-date");
                        date.valueAsDate = new Date(todo.due);
                        date.classList.remove("empty")
                        let priority = document.querySelector("#todo-priority");
                        priority.value = todo.priority;
                        priority.classList.remove("empty");
                        todoModal.showModal();
                    });
                    buttons.appendChild(button);
                    break;
                case "move":
                    button.addEventListener("click", () => {
                        if (logic.projects.length === 1){
                            let message = document.querySelector(".other-message");
                            message.innerText = "You must have more than one project to move a task.";
                            otherModal.showModal();
                            return;
                        }
                        moveModal.showModal();
                        moveModal.dataset.todoID = todo.id;
                        let select = document.querySelector(".project-dropdown");
                        const maxLen = 16;
                        for (const project of logic.projects){
                            if (project === logic.getCurrentProject()) continue;
                            let option = document.createElement("option");
                            option.innerText = project.name;
                            if (project.name.length > maxLen)
                                option.innerText = project.name.substring(0,maxLen-3) + "...";
                            option.value = project.id;
                            select.appendChild(option);
                        }
                    });
                    buttons.appendChild(button);
                    break;
                case "delete":
                    button.addEventListener("click", () => {
                        logic.deleteTodo(todo.id);
                        populateTodos();
                        updateCurrentCount();
                    });
                    buttons.appendChild(button);
                    break;
            }            
        }

        let desc = document.createElement("p");
        desc.classList.add("description");
        desc.innerText = todo.description;
        if (todo.description.trim() === ""){
            desc.innerText = "No description..."
            desc.classList.add("no-desc");
        }else
            desc.classList.remove("no-desc");
            

        appendChildren(header, [info, buttons]);

        appendChildren(body, [header, desc]);
        appendChildren(item, [bar, body]);

        item.addEventListener("click", (event) => {
            let buttonHit = false;
            for (const button of buttons.children){
                const rect = button.getBoundingClientRect();
                const isClickOutside = (
                    event.clientX < rect.left ||
                    event.clientX > rect.right ||
                    event.clientY < rect.top ||
                    event.clientY > rect.bottom
                );
                if (!isClickOutside) {
                    buttonHit = true;
                    break;
                }
            }
            if (buttonHit) return;
            toggleTodoExpansion(item);
        });

        item.tabIndex = 0;
        item.addEventListener("keydown", (e) => {
            e.stopPropagation();
            if (e.key != "Space" && e.key != "Enter") return;
            toggleTodoExpansion(item);
        })

        const todoList = document.querySelector(".todo-list");
        todoList.appendChild(item);
        return item;
    };

    const toggleTodoExpansion = (item) => {
        if (item.classList.contains("expanded")){
            item.classList.remove("expanded");
            const index = logic.expandedIDs.indexOf(item.dataset.id);
            logic.expandedIDs.splice(index, 1);
        }
        else{
            item.classList.add("expanded");
            logic.expandedIDs.push(item.dataset.id);
        }
        updateScrollBar();
    }

    const populateTodos = () => {
        let todoItems = document.querySelectorAll(".todo-item");
        for (const todo of todoItems) todo.remove();
        let search = document.querySelector(".search.todos").value.trim().toLowerCase();
        let todos = logic.todos.filter((todo) => {return todo.projectID === logic.current})
                               .filter((todo) => {return logic.filters.includes(todo.priority)
                                                      && logic.filters.includes(todo.status);})
                               .filter((todo) => {return todo.title.includes(search)});
        
        for (const todo of todos) createTodoItemUI(todo);
        
        let noTodo = document.querySelector(".no-todos");
        if (todos.length > 0)
            noTodo.classList.add("hidden");   
        else
            noTodo.classList.remove("hidden");
    };

    const clearModal = document.querySelector(".clear-todos.modal"); 
    const clearConfirm = document.querySelector(".clear-todos .delete");
    clearConfirm.addEventListener("click", () => {
        logic.clearTodos();
        let list = document.querySelector(".todo-list");
        for (const todo of document.querySelectorAll(".todo-item")){
            list.removeChild(todo);
        }
        let noTodo = document.querySelector(".no-todos");
        noTodo.classList.remove("hidden");
        updateCurrentCount();
        clearModal.close();
    });  

    const moveModal = document.querySelector(".move-todo");
    const confirmMove = document.querySelector(".move-todo .confirm");
    confirmMove.addEventListener("click", (e) => {
        let targetBox = document.querySelector(".project-dropdown");
        if (targetBox.value === ""){
            targetBox.classList.add("required");
            e.stopPropagation();
            return;
        }
        logic.moveTodo(moveModal.dataset.todoID, targetBox.value);
        populateTodos();
        updateCurrentCount();
        let target = document.querySelector(`[data-id="${targetBox.value}"] .todo-count`);
        console.log(target);
        target.innerText = +target.innerText + 1;
        moveModal.close();
    });

    const createProject = document.querySelector(".add-project");
    createProject.addEventListener("click", () => {
        if (logic.projects.length === 8){
            let message = document.querySelector(".other-message");
            message.innerText = "You have reached the maximum project limit."
            otherModal.showModal();
            return;
        }
        let heading = document.querySelector(".project-modal .heading");
        heading.innerText = "New Project";
        projectModal.classList.add("create");
        projectModal.showModal();
    });

    const createTodo = document.querySelector(".add-todo");
    createTodo.addEventListener("click", () => {
        let heading = document.querySelector(".todo-modal .heading");
        heading.innerText = "New Task";
        todoModal.classList.add("create");
        todoModal.showModal();
    });

    const resetTodos = document.querySelector(".reset-todos");
    resetTodos.addEventListener("click", () => {
        logic.resetTodos();
        populateTodos();
    });

    const clearTodos = document.querySelector(".delete-todos");
    clearTodos.addEventListener("click", () => {
        if (!logic.getTodoCount(logic.getCurrentProject().id)) return;
        let name = document.querySelector(".clear-todos .name");
        name.innerText = logic.getCurrentProject().name;
        clearModal.showModal();
    });

    const low = document.querySelector(".filter-button.low");
    low.addEventListener("click", () => {
        if (logic.filters.includes(Priority.LOW)){
            logic.removeFilter(Priority.LOW);
            low.classList.remove("active");
        }else{
            logic.addFilter(Priority.LOW);
            low.classList.add("active");
        }
        populateTodos();
    });

    const mid = document.querySelector(".filter-button.mid");
    mid.addEventListener("click", () => {
        if (logic.filters.includes(Priority.MID)){
            logic.removeFilter(Priority.MID);
            mid.classList.remove("active");
        }else{
            logic.addFilter(Priority.MID);
            mid.classList.add("active");
        }
        populateTodos();
    });

    const high = document.querySelector(".filter-button.high");
    high.addEventListener("click", () => {
        if (logic.filters.includes(Priority.HIGH)){
            logic.removeFilter(Priority.HIGH);
            high.classList.remove("active");
        }else{
            logic.addFilter(Priority.HIGH);
            high.classList.add("active");
        }
        populateTodos();
    });

    const incomplete = document.querySelector(".filter-button.incomplete");
    incomplete.addEventListener("click", () => {
        if (logic.filters.includes(Status.INCOMPLETE)){
            logic.removeFilter(Status.INCOMPLETE);
            incomplete.classList.remove("active");
        }else{
            logic.addFilter(Status.INCOMPLETE);
            incomplete.classList.add("active");
        }
        populateTodos();
    });

    const complete = document.querySelector(".filter-button.complete");
    complete.addEventListener("click", () => {
        if (logic.filters.includes(Status.COMPLETE)){
            logic.removeFilter(Status.COMPLETE);
            complete.classList.remove("active");
        }else{
            logic.addFilter(Status.COMPLETE);
            complete.classList.add("active");
        }
        populateTodos();
    });

    const todoList = document.querySelector(".todo-list");
    todoList.classList.add("scroll-top");
    todoList.addEventListener("scroll", () => {
        updateScrollBar();
    });

    const updateScrollBar = () => {
        const top = todoList.scrollTop;
        if (top <= 7)
            todoList.classList.add("scroll-top");
        else
            todoList.classList.remove("scroll-top");

        if (top + todoList.clientHeight >= todoList.scrollHeight-8)
            todoList.classList.add("scroll-bottom");
        else
            todoList.classList.remove("scroll-bottom");
    }; 

    for (const project of logic.projects){
        createProjectItemUI(project);
    }
    let current = logic.getCurrentProject();
    setCurrentBox(current);
    for (const item of document.querySelectorAll(".project-item")){
        if (item.dataset.id !== current.id) continue;
        item.classList.add("selected");
    }
    populateTodos();
    for (const filter of document.querySelectorAll(".filter-button")){
        if (logic.filters.includes(filter.dataset.filter))
            filter.classList.add("active");
        else
            filter.classList.remove("active");
    }
};
