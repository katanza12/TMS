import { Injectable, inject } from '@angular/core';
import { forkJoin, Subject, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { TaskModel } from '../models/task.model';
import { TaskExtendModel } from '../models/task.model';
import { UserModel } from '../models/user.model';
import { DataModel } from '../models/data.model';

import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private databaseService = inject(DatabaseService);

  //#region SUBJECTS
  private taskReadSubject = new Subject<TaskExtendModel>();
  private taskListSubject = new Subject<TaskModel[]>();
  private taskSaveSubject = new Subject<number>();
  private taskMaxIdSubject = new Subject<number>();
  private taskDeleteSubject = new Subject<number>();
  private taskReloadSubject = new Subject<void>();


  public registerRead() {
    return this.taskReadSubject.asObservable();
  }

  public registerList() {
    return this.taskListSubject.asObservable();
  }

  public registerSave() {
    return this.taskSaveSubject.asObservable();
  }

  public registerMaxId() {
    return this.taskMaxIdSubject.asObservable();
  }

  public registerDelete() {
    return this.taskDeleteSubject.asObservable();
  }

  public registerReload() {
    return this.taskReloadSubject.asObservable();
  }
  //#endregion

  //#region TASK
  public getTaskById(id: number) {
    setTimeout(() => {
      this.databaseService.getTaskById(id).subscribe({
        next: (response) => {
          const task = response as TaskModel;
          forkJoin({
            usersExtend: this.databaseService.getUsersByArrayId(task.users),
            statusExtend: this.databaseService.getStatusById(task.status),
            categoryExtend: this.databaseService.getCategoryById(task.category)
          }).subscribe({
            next: ({ usersExtend, statusExtend, categoryExtend }) => {
              if (!usersExtend || !statusExtend || !categoryExtend) {
                throw new Error('User, status, or category not found');
              }
              this.taskReadSubject.next({
                ...task,
                usersExtend: usersExtend as UserModel[],
                statusExtend: statusExtend as DataModel,
                categoryExtend: categoryExtend as DataModel
              });
            },
            error: (error) => {
              console.log("Error getTaskById:", error);
              this.taskReadSubject.error(error);
            }
          })
        },
        error: (error) => {
          console.log("Error getTaskById:", error);
          this.taskReadSubject.error(error);
        }
      })
    }, 1000);

  }

  public getAllTasks() {
    this.databaseService.getTasks().subscribe({
      next: (response) => {
        this.taskListSubject.next(response as TaskModel[]);
      },
      error: (error) => {
        console.log("Error getAllTasks:", error);
        this.taskListSubject.error(error);
      }
    })
  }

  public getUserTasks(userId: number) {
    this.databaseService.getTasks().subscribe({
      next: (response) => {
        const tasks = response as TaskModel[];
        const userTasks = tasks.filter(task => task.users.indexOf(userId) >= 0);
        this.taskListSubject.next(userTasks);
      },
      error: (error) => {
        console.log("Error getUserTasks:", error);
        this.taskListSubject.error(error);
      }
    })
  }

  public getUserTaskByStatus(userId: number, statusId: number) {
    this.databaseService.getTasks().subscribe({
      next: (response) => {
        const tasks = response as TaskModel[];
        const statusTasks = tasks.filter(task => task.users.includes(userId) && task.status == statusId);
        this.taskListSubject.next(statusTasks);
      },
      error: (error) => {
        console.log("Error getUserTaskByStatus:", error);
        this.taskListSubject.error(error);
      }
    })
  }

  public getUserTaskByCategory(userId: number, categoryId: number) {
    this.databaseService.getTasks().subscribe({
      next: (response) => {
        const tasks = response as TaskModel[];
        const categoryTasks = tasks.filter(task => task.users.includes(userId) && task.category == categoryId);
        this.taskListSubject.next(categoryTasks);
      },
      error: (error) => {
        console.log("Error getUserTaskByCategory:", error);
        this.taskListSubject.error(error);
      }
    })
  }

  public saveTask(task: TaskModel) {
    this.getMaxId();

    this.registerMaxId().subscribe({
      next: (response) => {
        const maxId = response as number;
        task.id = maxId + 1;

        this.databaseService.saveTask(task).subscribe({
          next: (response) => {
            const task = response as TaskExtendModel;
            this.taskSaveSubject.next(task.id);
          },
          error: (error) => {
            console.log("Error saveTask:", error);
            this.taskSaveSubject.error(error);
          }
        });
      },
      error: (error) => {
        console.log("Error getMaxId:", error);
        this.taskMaxIdSubject.error(error);
      }
    })
  }

  private getMaxId() {
    this.databaseService.getTasks().subscribe({
      next: (response) => {
        const tasks = response as TaskModel[];
        const maxId = tasks.reduce((max, task) => Math.max(max, task.id), 0);
        this.taskMaxIdSubject.next(maxId);
      },
      error: (error) => {
        console.log("Error getMaxId:", error);
        this.taskMaxIdSubject.error(error);
      }
    })
  }

  public updateTask(task: TaskModel) {
    this.databaseService.updateTask(task).subscribe({
      next: (response) => {
        const task = response as TaskExtendModel;
        this.taskSaveSubject.next(task.id);
      },
      error: (error) => {
        console.log("Error updateTask:", error);
        this.taskSaveSubject.error(error);
      }
    })
  }

  public deleteTask(id: number) {
    this.databaseService.deleteTask(id).subscribe({
      next: (response) => {
        const task = response as TaskExtendModel;
        this.taskDeleteSubject.next(task.id);
      },
      error: (error) => {
        console.log("Error deleteTask:", error);
        this.taskDeleteSubject.error(error);
      }
    })
  }

  public reloadTasks() {
    this.taskReloadSubject.next();
  }
  //#endregion



}
