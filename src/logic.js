import { format } from "date-fns";

export const Priority = Object.freeze({LOW:"low", MID:"mid", HIGH:"high"});
export const Status = Object.freeze({INCOMPLETE:"incomplete", COMPLETE: "complete"});

class Todo {
    constructor(title, description, dueDate, priority, projectID){
        this.title = title;
        this.description = description;
        this.due = dueDate;
        this.priority = priority;
        this.status = Status.INCOMPLETE;
        this.id = crypto.randomUUID();
        this.projectID = projectID;
    }
}

class Project {
    constructor(name, summary){
        this.name = name;
        this.summary = summary;
        this.created = format(new Date(), "MM/dd/yyyy");
        this.id = crypto.randomUUID();
    }
}

export class LogicHandler {    
    constructor () {
        this.projects = [];
        this.currentProject = this.createProject("default", "Generic summary");
        this.todos = [];
        this.filters = [...Object.values(Priority), ...Object.values(Status)];
    
        this.createTodo("examle task", "this is a basic example todo.", new Date(), Priority.LOW);
    }

    createProject = (name, summary) => {
        const project = new Project(name, summary);
        this.projects.push(project);
        return project;
    }

    deleteProject = (projectID) => {
        for (const project of this.projects){
            if (projectID !== project.id) continue;
            const index = this.projects.indexOf(project);
            this.projects.splice(index, 1);
            this.todos = this.todos.filter((todo) => {return todo.projectID !== projectID});
            if (this.currentProject === project) 
                this.currentProject = this.projects[0];
            return;
        }
    }

    editProject = (projectID, name, summary) => {
        for (const project of this.projects){
            if (projectID !== project.id) continue;
            project.name = name;
            project.summary = summary;
            return;
        }
    }

    selectProject = (projectID) => {
        for (const project of this.projects){
            if (projectID !== project.id) continue;
            if (project === this.currentProject) return;
            this.currentProject = project;
            return;
        }
    }

    getTodoCount = (projectID) => {
        let count = 0;
        for (const todo of this.todos){
            if (todo.projectID !== projectID) continue;
            count++;
        }
        return count;
    }

    createTodo = (title, description, dueDate, priority) => {
        const todo = new Todo(title, description, dueDate, priority, this.currentProject.id);
        this.todos.push(todo);
        return todo
    };

    editTodo = (todoID, title, description, dueDate, priority) => {
        for (const todo of this.todos){
            if (todoID !== todo.id) continue;
            todo.title = title;
            todo.description = description;
            todo.due = dueDate;
            todo.priority = priority;
            return;
        }
    }

    deleteTodo = (todoId) => {
        for (const todo of this.todos){
            if (todoId !== todo.id) continue;
            const index = this.todos.indexOf(todo);
            this.todos.splice(index, 1);
            return;
        }
    }

    toggleTodoStatus = (todoID) => {
        for (const todo of this.todos){
            if (todoID !== todo.id) continue;
            todo.status = (todo.status == Status.INCOMPLETE) ? Status.COMPLETE : Status.INCOMPLETE;
            return;
        }
    }

    moveTodo = (todoID, targetID) => {
        for (const todo of this.todos){
            if (todoID !== todo.id) continue;
            todo.projectID = targetID;
            return;
        }
    }

    validateTodo = (todoID, filter) => {
        for (const todo of this.todos){
            if (todo.id !== todoID) continue;
            if (Object.values(Priority).includes(filter))
                return todo.priority === filter;
            else
                return todo.status === filter;
        }
    }

    resetTodos = () => {
        for (const todo of this.todos){
            if (todo.projectID !== this.currentProject.id) continue;
            todo.status = Status.INCOMPLETE;
            return;
        }
    }

    clearTodos = () => {
        this.todos = this.todos.filter((todo) => {return todo.projectID !== this.currentProject.id});
    }

    removeFilter = (type) => {
        if (!this.filters.includes(type)) return;
        const index = this.filters.indexOf(type);
        this.filters.splice(index, 1);
    }

    addFilter = (type) => {
        if (this.filters.includes(type)) return;
        this.filters.push(type);
    }
}