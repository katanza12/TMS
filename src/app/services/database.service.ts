import { Injectable, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { environment } from '../../environments/environment';
import { forkJoin } from 'rxjs';
import { TaskModel } from '../models/task.model';
import { DataModel } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private httpClient = inject(HttpClient);

  private baseUrl = environment.backendEndPoint + "/";

  private URL_LIST = {
    // Tasks
    LIST_TASK: this.baseUrl + "tasks",
    TASK: this.baseUrl + "tasks/:id",
    SAVE_TASK: this.baseUrl + "tasks",
    UPDATE_TASK: this.baseUrl + "tasks/:id",
    DELETE_TASK: this.baseUrl + "tasks/:id",
    // Users
    LIST_USER: this.baseUrl + "users",
    USER: this.baseUrl + "users/:id",
    FILTER_USER: this.baseUrl + "users?:id",
    // Data
    STATUS: this.baseUrl + "status",
    STATUS_ID: this.baseUrl + "status/:id",
    STATUS_SAVE: this.baseUrl + "status/:id",
    CATEGORIES: this.baseUrl + "categories",
    CATEGORIES_ID: this.baseUrl + "categories/:id",
    CATEGORIES_SAVE: this.baseUrl + "categories/:id",
  }

  //#region TASK
  getTaskById(id: number) {
      return this.httpClient.get(this.URL_LIST.TASK.replace(":id", id.toString()));
  }

  getTasks() {
    return this.httpClient.get(this.URL_LIST.LIST_TASK);
  }

  saveTask(task: TaskModel){
    const taskConvert = {
      id: String(task.id),
      title: task.title,
      description: task.description,
      status: task.status,
      category: task.category,
      users: task.users
    }
    return this.httpClient.post(this.URL_LIST.SAVE_TASK, taskConvert);
  }

  updateTask(task: TaskModel){
    const taskConvert = {
      id: String(task.id),
      title: task.title,
      description: task.description,
      status: task.status,
      category: task.category,
      users: task.users
    }
    return this.httpClient.patch(this.URL_LIST.UPDATE_TASK.replace(":id", task.id.toString()), taskConvert);
  }

  deleteTask(id: number) {
    return this.httpClient.delete(this.URL_LIST.DELETE_TASK.replace(":id", id.toString()));
  }
  //#endregion

  //#region USER

  getUserById(id: number) {
    return this.httpClient.get(this.URL_LIST.USER.replace(":id", id.toString()));
  }

  getUsersByArrayId(idList: number[]) {
    //const queryParams = idList.map(id => `id=${id}`).join('&');
    //return this.httpClient.get(this.URL_LIST.FILTRO_USER.replace(":id", queryParams));
    return forkJoin(idList.map(id => this.getUserById(id)));
  }

  getUsers() {
    return this.httpClient.get(this.URL_LIST.LIST_USER);
  }
  //#endregion

  //#region STATUS
  getAllStatus() {
    return this.httpClient.get(this.URL_LIST.STATUS);
  }

  getStatusById(id: number) {
    return this.httpClient.get(this.URL_LIST.STATUS_ID.replace(":id", id.toString()));
  }

  saveStatus(status: DataModel) {
    return this.httpClient.patch(this.URL_LIST.STATUS_SAVE.replace(":id", status.id.toString()), status);
  }
  //#endregion

  //#region CATEGORIES
  getAllCategories() {
    return this.httpClient.get(this.URL_LIST.CATEGORIES);
  }

  getCategoryById(id: number) {
    return this.httpClient.get(this.URL_LIST.CATEGORIES_ID.replace(":id", id.toString()));
  }

  saveCategory(category: DataModel) {
    return this.httpClient.patch(this.URL_LIST.CATEGORIES_SAVE.replace(":id", category.id.toString()), category);
  }
  //#endregion

}
