import { DataModel } from "./data.model";
import { UserModel } from "./user.model";

export type TaskModel = {
  id:number;
  category:number;
  title:string;
  description:string;
  status:number;
  users:number[];
}

export type TaskExtendModel = TaskModel & {
  usersExtend: UserModel[];
  statusExtend: DataModel;
  categoryExtend: DataModel;
}

export enum ShowModeEnum {
  VIEW,
  EDIT,
  NEW,
  NONE
}
