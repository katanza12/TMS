import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  public getAvatarLabel(user: UserModel): string {
    let retLable = "";
    if (user.firstName) retLable += user.firstName.charAt(0).toUpperCase();
    if (user.lastName) retLable += user.lastName.charAt(0).toUpperCase();
    return retLable;
  }
}
