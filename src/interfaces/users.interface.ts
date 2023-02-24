export interface User {
  id: number;
  email: string;
  username: string;
  userSource: number;
}

export interface UserData {
  email: string;
  username: string;
  password?: string;
  userSource: number;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserSingUp{
  email: string;
  password?: string;
  username: string;
  userSource: number;
}

export interface GoogleSignup{
  email:string;
  name:string;
}