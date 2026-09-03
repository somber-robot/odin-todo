import { format } from "date-fns";

export const Priority = Object.freeze({ LOW: "low", MID: "mid", HIGH: "high" });
export const Status = Object.freeze({
  INCOMPLETE: "incomplete",
  COMPLETE: "complete",
});

const Todo = (title, description, due, priority, projectID) => {
  return {
    title,
    description,
    due,
    priority,
    projectID,
    status: Status.INCOMPLETE,
    id: crypto.randomUUID(),
  };
};

const Project = (name) => {
  return {
    name,
    created: format(new Date(), "do MMM yyyy"),
    id: crypto.randomUUID(),
  };
};

export class LogicHandler {
  constructor() {
    this.init();
    this.expandedIDs = [];
  }

  storageFree = () => {
    let storage;
    try {
      storage = window.localStorage;
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        e.name === "QuotaExceededError" &&
        storage &&
        storage.length !== 0
      );
    }
  };

  init = () => {
    if (!this.storageFree()) return;
    if (localStorage.getItem("projects")) {
      console.log("load");
      this.loadData("projects", "todos", "filters", "current");
    } else {
      console.log("new");
      this.projects = [];
      this.current = this.createProject("default").id;
      this.todos = [];
      this.filters = [...Object.values(Priority), ...Object.values(Status)];

      this.createTodo(
        "example task",
        "this is a basic example todo.",
        new Date(),
        Priority.LOW,
      );
      this.saveData("projects", "todos", "filters", "current");
    }
  };

  saveData = (...types) => {
    for (const type of types) {
      localStorage[type] = JSON.stringify(this[type]);
    }
  };

  loadData = (...types) => {
    for (const type of types) {
      this[type] = JSON.parse(localStorage[type]);
    }
  };

  createProject = (name) => {
    const project = Project(name);
    this.projects.push(project);
    this.saveData("projects");
    return project;
  };

  deleteProject = (projectID) => {
    for (const project of this.projects) {
      if (projectID !== project.id) continue;
      const index = this.projects.indexOf(project);
      this.projects.splice(index, 1);
      this.todos = this.todos.filter((todo) => {
        return todo.projectID !== projectID;
      });
      this.current = this.projects[0].id;
      break;
    }
    this.saveData("projects", "current");
  };

  editProject = (name) => {
    for (const project of this.projects) {
      if (project.id !== this.current) continue;
      project.name = name;
      break;
    }
    this.saveData("projects");
  };

  selectProject = (projectID) => {
    for (const project of this.projects) {
      if (projectID !== project.id) continue;
      if (project.id === this.current) return;
      this.current = project.id;
      break;
    }
    this.saveData("current");
  };

  getCurrentProject = () => {
    for (const project of this.projects) {
      if (project.id !== this.current) continue;
      return project;
    }
  };

  getTodoCount = (projectID) => {
    let count = 0;
    for (const todo of this.todos) {
      if (todo.projectID !== projectID) continue;
      count++;
    }
    return count;
  };

  createTodo = (title, description, dueDate, priority) => {
    const todo = Todo(title, description, dueDate, priority, this.current);
    this.todos.push(todo);
    this.saveData("todos");
    return todo;
  };

  editTodo = (todoID, title, description, dueDate, priority) => {
    for (const todo of this.todos) {
      if (todoID !== todo.id) continue;
      todo.title = title;
      todo.description = description;
      todo.due = dueDate;
      todo.priority = priority;
      break;
    }
    this.saveData("todos");
  };

  deleteTodo = (todoId) => {
    for (const todo of this.todos) {
      if (todoId !== todo.id) continue;
      const index = this.todos.indexOf(todo);
      this.todos.splice(index, 1);
      break;
    }
    this.saveData("todos");
  };

  toggleTodoStatus = (todoID) => {
    for (const todo of this.todos) {
      if (todoID !== todo.id) continue;
      todo.status =
        todo.status == Status.INCOMPLETE ? Status.COMPLETE : Status.INCOMPLETE;
      break;
    }
    this.saveData("todos");
  };

  moveTodo = (todoID, targetID) => {
    for (const todo of this.todos) {
      if (todoID !== todo.id) continue;
      todo.projectID = targetID;
      break;
    }
    this.saveData("todos");
  };

  validateTodo = (todoID, filter) => {
    for (const todo of this.todos) {
      if (todo.id !== todoID) continue;
      if (Object.values(Priority).includes(filter))
        return todo.priority === filter;
      else return todo.status === filter;
    }
  };

  resetTodos = () => {
    for (const todo of this.todos) {
      if (todo.projectID !== this.current) continue;
      todo.status = Status.INCOMPLETE;
    }
    this.saveData("todos");
  };

  clearTodos = () => {
    this.todos = this.todos.filter((todo) => {
      return todo.projectID !== this.current;
    });
    this.saveData("todos");
  };

  removeFilter = (type) => {
    if (!this.filters.includes(type)) return;
    const index = this.filters.indexOf(type);
    this.filters.splice(index, 1);
    this.saveData("filters");
  };

  addFilter = (type) => {
    if (this.filters.includes(type)) return;
    this.filters.push(type);
    this.saveData("filters");
  };
}
