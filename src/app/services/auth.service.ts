import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';

import { DatabaseService } from './database.service';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private databaseService = inject(DatabaseService);

  private loginSubject = new Subject<UserModel>();

  public registerLoginSubject() {
    return this.loginSubject.asObservable();
  }

  public login(username: string, password: string) {
    this.databaseService.getUsers().subscribe({
      next: (response) => {
        const users = response as UserModel[];
        const user = users.find(user => user.email === username && user.password === password);
        if (user) {
          this.loginSubject.next(user);
        } else {
          this.loginSubject.error("Invalid username or password");
        }
      },
      error: (error) => {
        console.log(error);
        this.loginSubject.error(error);
      }
    });
  }

}
