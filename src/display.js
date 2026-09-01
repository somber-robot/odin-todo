import { Priority, Status } from "./logic.js";
import svgs from "./svgs.json";
import { format } from "date-fns";

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
    // modal code
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
        });
        modal.addEventListener("toggle", (e) => {
            if (e.newState !== "open") return;
            modal.classList.add("is-open");
        });
        modal.addEventListener("click", (e) => {
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

    const projectModal = document.querySelector(".project-modal");
    const projectName = document.querySelector("#project-name");
    
    for (const input of document.querySelectorAll(".modal-input")){
        input.addEventListener("input", () => {
            input.classList.remove("required");
        });
    }

    const projectSearch = document.querySelector(".search.projects");
    projectSearch.addEventListener("input", () => {
        let filter = projectSearch.value.trim();
        for (const item of document.querySelectorAll(".project-item")){
            let name = item.firstElementChild.innerText;
            if (name.includes(filter)) 
                item.classList.remove("filtered");
            else
                item.classList.add("filtered");
        }
    });

    const projectConfirm = document.querySelector(".project-modal .confirm");
    projectConfirm.addEventListener("click", () => {
        let name = projectName.value.trim();
        if (name === ""){
            projectName.classList.add("required");
            return;
        } 
        let summary = document.querySelector("#project-summary").value.trim();
        if (projectModal.classList.contains("create")){
            createProjectItem(name, summary);
        } else 
        if (projectModal.classList.contains("edit")){
            logic.editProject(logic.currentProject.id, name, summary);
            setCurrentBox(logic.currentProject);
            for (const item of document.querySelectorAll(".project-item")){
                if (item.dataset.id !== logic.currentProject.id) continue;
                item.firstElementChild.innerText = name;
                break;
            }
        }
        projectModal.close();
    });

    const projectList = document.querySelector(".project-list");

    const createProjectItem = (projectName, summary) => {
        let project = logic.createProject(projectName, summary);
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

        projectItem.addEventListener("click", () => {
            let currentID = logic.currentProject.id;
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
        });

        appendChildren(projectItem, [name, count]);
        projectList.appendChild(projectItem);
        return projectItem;
    }

    const updateCurrentCount = () => {
        let count = document.querySelector(".current-project .footer .todo-count");
        let todoCount = logic.getTodoCount(logic.currentProject.id);
        count.innerText = `${todoCount} task${(todoCount == 1) ? "" : "s"}`;
        let itemCount = document.querySelector(`[data-id="${logic.currentProject.id}"] .todo-count`);
        itemCount.innerText = todoCount;
    };

    const setCurrentBox = (project) => {
        let name = document.querySelector(".current-project .name");
        name.innerText = project.name;
        let date = document.querySelector(".current-project .created");
        date.innerText = project.created;
        let summary = document.querySelector(".current-project .summary");
        summary.innerText = project.summary;
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
            let desc = document.querySelector(".project-modal #project-summary");
            desc.value = project.summary;
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
            name.innerText = logic.currentProject.name;
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
            if (item.dataset.id !== logic.currentProject.id) continue;
            item.remove();
            break;
        }
        logic.deleteProject(logic.currentProject.id);
        for (const item of items){
            if (item.dataset.id !== logic.currentProject.id) continue;
            item.classList.add("selected");
            break;
        }
        setCurrentBox(logic.currentProject);
        populateTodos();
        deleteModal.close();
    });

    const todoModal = document.querySelector(".todo-modal");

    const todoSearch = document.querySelector(".search.todos");
    todoSearch.addEventListener("input", () => {
        let filter = todoSearch.value.trim();
        for (const item of document.querySelectorAll(".todo-item")){
            let name = document.querySelector(`[data-id="${item.dataset.id}"] .name`).innerText;
            if (name.includes(filter)) 
                item.classList.remove("filtered");
            else
                item.classList.add("filtered");
        }
    });

    const confirmTodo = document.querySelector(".todo-modal .confirm");
    confirmTodo.addEventListener("click", () => {
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
        if (invalid) return;
  
        if (todoModal.classList.contains("create")){
            createTodoItem(name.value.trim(), desc.value.trim(), new Date(date.value), priority.value);
            updateCurrentCount();
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
            due.innerText = format(date.valueAsDate, "MM/dd/yyyy");

            let summary = document.querySelector(`[data-id='${id}'] .todo-body .description`);
            summary.innerText = desc.value.trim();         

        }
        todoModal.close();
    });

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
        date.innerText = format(todo.due, "MM/dd/yyyy");
    
        appendChildren(info, [name, date]);

        let buttonsH = document.createElement("div");
        buttonsH.classList.add("todo-buttons");
        let buttonsD = document.createElement("div");
        buttonsD.classList.add("todo-buttons");

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
                    buttonsH.appendChild(button);
                    break;
                case "edit":
                    button.addEventListener("click", () => {
                        todoModal.classList.add("edit");
                        todoModal.dataset.editID = todo.id;
                        let heading = document.querySelector(".todo-modal .heading");
                        heading.innerText = "Edit Todo";
                        let name = document.querySelector("#todo-title");
                        name.value = todo.title;
                        let desc = document.querySelector("#todo-description");
                        desc.value = todo.description;
                        let date = document.querySelector("#todo-date");
                        date.valueAsDate = todo.due;
                        let priority = document.querySelector("#todo-priority");
                        priority.value = todo.priority;
                        todoModal.showModal();
                    });
                    buttonsD.appendChild(button);
                    break;
                case "move":
                    button.addEventListener("click", () => {
                        if (logic.projects.length === 1){
                            let message = document.querySelector(".other-message");
                            message.innerText = "You must have more than one project to move a task.";
                            otherModal.showModal();
                            return;
                        }
                        let title = document.querySelector(".move-todo .todo-title");
                        title.innerText = todo.title;
                        let current = document.querySelector(".move-todo .project-name");
                        current.innerHTML = logic.currentProject.name;
                        moveModal.showModal();
                        moveModal.dataset.todoID = todo.id;
                        let select = document.querySelector(".project-dropdown");
                        for (const project of logic.projects){
                            if (project === logic.currentProject) continue;
                            let option = document.createElement("option");
                            option.innerText = project.name;
                            option.value = project.id;
                            select.appendChild(option);
                        }
                    });
                    buttonsD.appendChild(button);
                    break;
                case "delete":
                    button.addEventListener("click", () => {
                        logic.deleteTodo(todo.id);
                        item.remove();
                        updateCurrentCount();
                    });
                    buttonsH.appendChild(button);
                    break;
            }            
        }

        let details = document.createElement("div");
        details.classList.add("details");

        let desc = document.createElement("p");
        desc.classList.add("description");
        desc.innerText = todo.description;

        appendChildren(header, [info, buttonsH]);
        appendChildren(details, [desc, buttonsD]);

        appendChildren(body, [header, details]);
        appendChildren(item, [bar, body]);

        info.addEventListener("click", () => {
            if (item.classList.contains("expanded"))
                item.classList.remove("expanded");
            else
                item.classList.add("expanded");
        });

        desc.addEventListener("click", () => {
            if (item.classList.contains("expanded"))
                item.classList.remove("expanded");
            else
                item.classList.add("expanded");
        });

        const todoList = document.querySelector(".todo-list");
        todoList.appendChild(item);
        return item;
    };

    const populateTodos = () => {
        let todoItems = document.querySelectorAll(".todo-item");
        for (const todo of todoItems) todo.remove();
        let todos = logic.todos.filter((todo) => {return todo.projectID === logic.currentProject.id})
                               .filter((todo) => {return logic.filters.includes(todo.priority)
                                                      && logic.filters.includes(todo.status);})
        for (const todo of todos) createTodoItemUI(todo);
    };

    const clearModal = document.querySelector(".clear-todos.modal"); 
    const clearConfirm = document.querySelector(".clear-todos .delete");
    clearConfirm.addEventListener("click", () => {
        logic.clearTodos();
        let list = document.querySelector(".todo-list");
        for (const todo of document.querySelectorAll(".todo-item")){
            list.removeChild(todo);
        }
        updateCurrentCount();
        clearModal.close();
    });  

    const moveModal = document.querySelector(".move-todo");
    const confirmMove = document.querySelector(".move-todo .confirm");
    confirmMove.addEventListener("click", () => {
        let targetBox = document.querySelector(".project-dropdown");
        if (targetBox.value === ""){
            targetBox.classList.add("required");
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

    // add event handlers to create project, create todo, reset todos and clear todos
    const createProject = document.querySelector(".add-project");
    createProject.addEventListener("click", () => {
        let heading = document.querySelector(".project-modal .heading");
        heading.innerText = "Add New Project";
        projectModal.classList.add("create");
        projectModal.showModal();
    });

    const createTodo = document.querySelector(".add-todo");
    createTodo.addEventListener("click", () => {
        let heading = document.querySelector(".todo-modal .heading");
        heading.innerText = "Add New Todo";
        todoModal.classList.add("create");
        todoModal.showModal();
    });

    const resetTodos = document.querySelector(".reset-todos");
    resetTodos.addEventListener("click", () => {
        logic.resetTodos();
        for (const todo of document.querySelectorAll(".todo-item")){
            todo.classList.remove("complete");
        }
    });

    const clearTodos = document.querySelector(".clear-todos");
    clearTodos.addEventListener("click", () => {
        if (!logic.todos.length) return;
        let name = document.querySelector(".clear-todos .name");
        name.innerText = logic.currentProject.name;
        clearModal.showModal();
    });

    // add event listeners to filter bar button
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

    // load projects, todos and filters from logic handler
    for (const project of logic.projects){
        createProjectItemUI(project);
    }
    let current = logic.currentProject;
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
