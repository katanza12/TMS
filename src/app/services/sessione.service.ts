import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { ToastMessageOptions } from 'primeng/api';

import { UserModel } from '../models/user.model';
import { DataModel } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class SessioneService {

  //#region MESSAGES
  private subjectMessage = new Subject<ToastMessageOptions>();

  registerMessage() {
    return this.subjectMessage.asObservable();
  }

  sendErrorMessage(msg: string) {
    this.subjectMessage.next({ severity: 'error', summary: 'Errore', detail: msg });
  }
  sendWarningMessage(msg: string) {
    this.subjectMessage.next({ severity: 'warn', summary: 'Attenzione', detail: msg });
  }
  sendInfoMessage(msg: string) {
    this.subjectMessage.next({ severity: 'info', summary: 'Informazione', detail: msg });
  }
  sendSuccessMessage(msg: string) {
    this.subjectMessage.next({ severity: 'success', summary: 'Successo', detail: msg });
  }
  //#endregion

  //#region USER LOGGED
  userLogged?: UserModel;

  setUserLogged(user?: UserModel) {
    this.userLogged = user;
  }
  getUserLogged() {
    return this.userLogged;
  }
  //#endregion

  //#region DATA
  statusList: DataModel[] = [];
  categoryList: DataModel[] = [];

  setStatusList(statusList: DataModel[]) {
    this.statusList = statusList;
  }

  getStatusList() {
    return this.statusList;
  }

  setCategoryList(categoryList: DataModel[]) {
    this.categoryList = categoryList;
  }

  getCategoryList() {
    return this.categoryList;
  }
  //#endregion

  //#region NEW TASK
  subjectNewTask = new Subject<boolean>();
  statusIdNewTask: number = 0;

  registerNewTask() {
    return this.subjectNewTask.asObservable();
  }

  setStatusIdNewTask(statusId: number) {
    this.statusIdNewTask = statusId;
  }

  getStatusIdNewTask() {
    return this.statusIdNewTask;
  }
  //#endregion


}
