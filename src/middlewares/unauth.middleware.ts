import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';

const unAuthMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.session['token'] || (req.header('token') ? req.header('token').split('Bearer ')[1] : null);
    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const { id } = (await verify(Authorization, secretKey)) as DataStoredInToken;
      const findUser = await UserEntity.findOne(id, { select: ['id', 'email', 'password','username'] });
      if (findUser) {
        req.session.user = findUser;
        res.redirect("/dashboard");
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next();
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default unAuthMiddleware;
