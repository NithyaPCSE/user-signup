import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User, GoogleSignup, UserLogin, UserSingUp } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';
import { CLIENTID } from "@config"
import { decode } from 'jsonwebtoken'

declare module 'express-session' {
  interface SessionData {
    token: string;
    user: User;
  }
}
class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: UserSingUp = req.body;
      const signUpUserData = await this.authService.signup(userData);

      res.status(201).json({ status: 200, data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: UserLogin = req.body;
      const { token, findUser } = await this.authService.login(userData);
      req.session.token = token;
      req.session.save();
      res.status(200).json({ status: 200, data: findUser, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.session.destroy(() => {
        res.redirect("/login")
      });
    } catch (error) {
      next(error);
    }
  };

  public signUpPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.render('signup', { clientId: CLIENTID })
    } catch (error) {
      next(error);
    }
  };

  public loginPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.render('login', { clientId: CLIENTID })
    } catch (error) {
      next(error);
    }
  };

  public dashboardPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.session.user as User;
      console.log(userData)
      res.render('dashboard', userData)
    } catch (error) {
      next(error);
    }
  };

  public googleSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jwtToken: string = req.query.token.toString();
      const type: string = req.query.type.toString();
      const userData: GoogleSignup = decode(jwtToken) as GoogleSignup
      const signUp = await this.authService.signup({
        email: userData.email,
        username: userData.name,
        userSource: 2
      })
      if (type == 'login') {
        const userLoginData: UserLogin = {
          email: userData.email,
          password: ''
        }
        const { token, findUser } = await this.authService.login(userLoginData, 2);
        req.session.token = token;
        req.session.save();
        res.status(200).json({ status: 200, data: findUser, message: 'login' });
      } else res.status(200).json({ status: 200, data: signUp, message: 'signup' });

    } catch (error) {
      next(error);
    }
  };

}

export default AuthController;
