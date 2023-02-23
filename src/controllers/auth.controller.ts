import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';
import {CLIENTID} from "@config"

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;
      const signUpUserData: User = await this.authService.signup(userData);

      res.status(201).json({ status:200,data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;
      const { cookie, findUser } = await this.authService.login(userData);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ status:200,data: findUser, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const logOutUserData: User = await this.authService.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: logOutUserData, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };

  public signUpPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.render('signup',{clientId: CLIENTID})
    } catch (error) {
      next(error);
    }
  };

  public loginPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {    
      res.render('login')
    } catch (error) {
      next(error);
    }
  };

  public dashboardPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {    
      const userData: User = req.user;
      res.render('dashboard',userData)
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
