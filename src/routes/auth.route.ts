import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import unAuthMiddleware from '@middlewares/unauth.middleware';

class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}signup`, this.authController.signUp);
    this.router.post(`${this.path}login`, this.authController.logIn);
    this.router.get(`${this.path}logout`, authMiddleware, this.authController.logOut);
    this.router.get(`${this.path}login`, unAuthMiddleware, this.authController.loginPage)
    this.router.get(`${this.path}signup`, unAuthMiddleware, this.authController.signUpPage)
    this.router.get(`${this.path}dashboard`, authMiddleware, this.authController.dashboardPage)
  }
}

export default AuthRoute;
