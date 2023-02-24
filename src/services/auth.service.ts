import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { EntityRepository, Repository } from 'typeorm';
import { SECRET_KEY } from '@config';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { UserData, UserLogin } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';

@EntityRepository()
class AuthService extends Repository<UserEntity> {
  public async signup(userData: UserData): Promise<UserEntity | string> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

    const findUser: UserEntity = await UserEntity.findOne({ where: { email: userData.email } });
    if (findUser) {
      if (userData.userSource === 2) return findUser
      else throw new HttpException(409, `This email ${userData.email} already exists`);
    }

    const hashedPassword = userData.userSource === 2 ? "" : await hash(userData.password, 10);
    const createUserData: UserEntity = await UserEntity.create({ email: userData.email, password: hashedPassword, username: userData.username, userSource: userData.userSource }).save();
    return createUserData;
  }

  public async login(userData: UserLogin, userSource = 1): Promise<{ token: string; findUser: UserEntity }> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

    const findUser: UserEntity = await UserEntity.findOne({ where: { email: userData.email} });
    if (!findUser) throw new HttpException(409, `This email is not matching`);

    const isPasswordMatching: boolean = (userSource==2)? true : await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "Password not matching");

    const tokenData:TokenData = this.createToken(findUser);
    const token=tokenData.token; 
    return { token, findUser };
  }

  public createToken(user: UserEntity): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}; SameSite: true;`;
  }
}

export default AuthService;
