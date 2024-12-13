export type UserModel = {
  id:number;
  firstName:string;
  lastName:string;
  email:string;
  password:string;
  role:string;
  background:string;
}

export type UserAvatarModel = {
  id: number,
  label:string;
  background:string;
}
