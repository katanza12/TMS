import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { UserModel } from '../models/user.model';

import { DatabaseService } from './database.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private databaseService = inject(DatabaseService);

  //#region SUBJECTS
  private userReadSubject = new Subject<UserModel>();
  private userListSubject = new Subject<UserModel[]>();

  public registerRead() {
    return this.userReadSubject.asObservable();
  }

  public registerList() {
    return this.userListSubject.asObservable();
  }
  //#endregion

  //#region METHODS
  public getUserById(id: number) {
    this.databaseService.getUserById(id).subscribe({
      next: (response) => {
        this.userReadSubject.next(response as UserModel);
      },
      error: (error) => {
        console.log(error);
        this.userReadSubject.error(error);
      }
    });
  }

  public getUserList() {
    this.databaseService.getUsers().subscribe({
      next: (response) => {
        this.userListSubject.next(response as UserModel[]);
      },
      error: (error) => {
        console.log(error);
        this.userListSubject.error(error);
      }
    });
  }

  //#endregion

}
