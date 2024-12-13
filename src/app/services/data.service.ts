import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';

import { DatabaseService } from './database.service';
import { TaskService } from './task.service';
import { SessioneService } from './sessione.service';

import { DataEnum, DataModel } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private databaseService = inject(DatabaseService);
  private taskService = inject(TaskService);
  private sessioneService = inject(SessioneService);

  //#region SUBJECT

  private dataLoadSubject = new Subject<DataEnum>();
  private dataSaveSubject = new Subject<boolean>();
  private statusListSubject = new Subject<DataModel[]>();
  private statusSubject = new Subject<DataModel>();
  private categoryListSubject = new Subject<DataModel[]>();
  private categorySubject = new Subject<DataModel>();

  public registerDataLoad() {
    return this.dataLoadSubject.asObservable();
  }

  public registerDataSave() {
    return this.dataSaveSubject.asObservable();
  }

  public registerStatusList() {
    return this.statusListSubject.asObservable();
  }

  public registerStatus() {
    return this.statusSubject.asObservable();
  }

  public registerCategoryList() {
    return this.categoryListSubject.asObservable();
  }

  public registerCategory() {
    return this.categorySubject.asObservable();
  }
  //#endregion

  //#region DATA
  public setDataLoad(data: DataEnum) {
    this.dataLoadSubject.next(data);
  }

  public saveData(type: DataEnum, data: DataModel) {
    if (type == DataEnum.Category) {
      this.databaseService.saveCategory(data).subscribe({
        next: (response) => {
          this.dataSaveSubject.next(true);
        },
        error: (error) => {
          console.log("Errore saveCategory:", error);
          this.dataSaveSubject.next(false);
        }
      });
    } else if (type == DataEnum.Status) {
      this.databaseService.saveStatus(data).subscribe({
        next: (response) => {
          this.dataSaveSubject.next(true);
          this.taskService.reloadTasks();
        },
        error: (error) => {
          console.log("Errore saveStatus:", error);
          this.dataSaveSubject.next(false);
        }
      });
    }
  }
  //#endregion

  //#region STATUS
  public getAllStatus() {
    this.databaseService.getAllStatus().subscribe({
      next: (response) => {
        const statusList = response as DataModel[];
        this.statusListSubject.next(statusList.sort((a, b) => a.sort - b.sort));
      },
      error: (error) => {
        console.log("Error getAllStatus:", error);
        this.statusListSubject.error(error);
      }
    })
  }

  public getStatusById(id: number) {
    this.databaseService.getStatusById(id).subscribe({
      next: (response) => {
        this.statusSubject.next(response as DataModel);
      },
      error: (error) => {
        console.log("Error getStatusById:", error);
        this.statusSubject.error(error);
      }
    })
  }
  //#endregion

  //#region CATEGORIES
  public getAllCategories() {
    this.databaseService.getAllCategories().subscribe({
      next: (response) => {
        const categoryList = response as DataModel[];
        this.categoryListSubject.next(categoryList.sort((a, b) => a.sort - b.sort));
      },
      error: (error) => {
        console.log("Error getAllCategories :", error);
        this.categoryListSubject.error(error);
      }
    })
  }

  public getCategoryById(id: number) {
    this.databaseService.getCategoryById(id).subscribe({
      next: (response) => {
        this.categorySubject.next(response as DataModel);
      },
      error: (error) => {
        console.log("Error getCategoryById:", error);
        this.categorySubject.error(error);
      }
    })
  }
  //#endregion

}
