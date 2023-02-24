import bcrypt from 'bcrypt';
import request from 'supertest';
import { createConnection, getConnection, Repository } from 'typeorm';
import App from '../app';
import { dbConnection } from '../databases';
import { UserEntity } from '../entities/users.entity';
import { User, GoogleSignup, UserLogin, UserSingUp } from '../interfaces/users.interface';
import AuthRoute from '../routes/auth.route';
import { decode } from 'jsonwebtoken'

beforeAll(async () => {
  await createConnection(dbConnection);
});

afterAll(async () => {
  await getConnection().close();
});

describe('Testing Auth', () => {
  describe('[POST] /signup', () => {
    it('response should have the Create userData', async () => {
      let userData = {
        email: 'test@email.com',
        password: 'q1w2e3r4!',
        username: "Test User",
        userSource: 1
      };

      const authRoute = new AuthRoute();
      const userRepository = new Repository<UserEntity>();

      userRepository.findOne = jest.fn().mockReturnValue(null);
      userRepository.save = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
        username: userData.username,
        userSource: 1
      });

      const app = new App([authRoute]);
      return request(app.getServer()).post(`${authRoute.path}signup`).send(userData).expect(201);
    });
  });

  describe('[POST] /login', () => {
    it('response should have the session header with the Authorization token', async () => {
      const userData = {
        email: 'test@email.com',
        password: 'q1w2e3r4!',
      };

      const authRoute = new AuthRoute();
      const userRepository = new Repository();

      userRepository.findOne = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
      });

      const app = new App([authRoute]);
      return request(app.getServer())
        .post(`${authRoute.path}login`)
        .send(userData)
        .expect('Set-Cookie', /^Authorization=.+/);
    });
  });

  describe('[GET] /logout', () => {
    it('logout Token Authorization=; Max-age=0', async () => {
      const authRoute = new AuthRoute();
      const app = new App([authRoute]);
      return request(app.getServer())
        .get(`${authRoute.path}logout`)
        .expect('Set-Cookie', /^Authorization=\;/);
    });
  });


  describe('[GET] /auth/google/verify', () => {
    it('response should have the Create userData by using google', async () => {
      let jwtToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQyNWY4ZGJjZjk3ZGM3ZWM0MDFmMDE3MWZiNmU2YmRhOWVkOWU3OTIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2NzcyMDU4NjMsImF1ZCI6Ijk1OTc1Mjg5NTYyMC12MHZ0YmxzMXJhaDF1NWIzcjE2NzhqMXFwMGMzZDF0Zy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMTU2OTE0MjY5NjI0MjczMDA0MiIsImVtYWlsIjoibml0aHlhcGFsYW5pOTZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6Ijk1OTc1Mjg5NTYyMC12MHZ0YmxzMXJhaDF1NWIzcjE2NzhqMXFwMGMzZDF0Zy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsIm5hbWUiOiJuaXRoeWEgcGFsYW5pIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FHTm15eFlwSGp6YmRGU0lnNW9BZ1JubktwRXBRdmJVTGNPZFd5S2JDTmJBPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Im5pdGh5YSIsImZhbWlseV9uYW1lIjoicGFsYW5pIiwiaWF0IjoxNjc3MjA2MTYzLCJleHAiOjE2NzcyMDk3NjMsImp0aSI6ImVmM2QzODZjNTg3NTJmMWM4ZTQ2YWVlOWM4NGRjOWIzNzEyMDExMGIifQ.xGBj9LFCORnD-O9kVt3rhlive9DRMvNO64vj2-iNstkQ3RcjPwjIbg_9wNR3iyPitKPQZoP94JoijwmYr9sxTo2hQxOoN5noSCyJyemJ1IgV9G5z2XQyDC7ap8yh2Sgufc0Au9E2zITu91_BkLfe55j5xK2nAP79atn75lG9UhSeg50QeGjJjDLOxTFi1Gg37npV0r-3DBFWuLLpxcWzEWAdicHr2tm9VfkUiG_hu4ifkkdNx4pPN67W28df3nt2QwNplxdCaS1GkakHivc9AkKF26gXGgzYOAPHcmJ7V_EyNR4Me8zAoA2twUb5Vk2oOLLmY03beL23ACR2iRKitQ';
      const userData: GoogleSignup = decode(jwtToken) as GoogleSignup
      const authRoute = new AuthRoute();
      const userRepository = new Repository<UserEntity>();
      userRepository.findOne = jest.fn().mockReturnValue(null);
      userRepository.save = jest.fn().mockReturnValue({
        id: 2,
        email: userData.email,
        password: '',
        username: userData.name,
        userSource: 2
      });
      const app = new App([authRoute]);
      return request(app.getServer()).get(`${authRoute.path}auth/google/verify`).send(userData).expect(200);
    });
  });

  describe('[GET] /auth/google/verify', () => {
    it('response should have the session header with the Authorization token by using google', async () => {
      let jwtToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQyNWY4ZGJjZjk3ZGM3ZWM0MDFmMDE3MWZiNmU2YmRhOWVkOWU3OTIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2NzcyMDU4NjMsImF1ZCI6Ijk1OTc1Mjg5NTYyMC12MHZ0YmxzMXJhaDF1NWIzcjE2NzhqMXFwMGMzZDF0Zy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMTU2OTE0MjY5NjI0MjczMDA0MiIsImVtYWlsIjoibml0aHlhcGFsYW5pOTZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6Ijk1OTc1Mjg5NTYyMC12MHZ0YmxzMXJhaDF1NWIzcjE2NzhqMXFwMGMzZDF0Zy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsIm5hbWUiOiJuaXRoeWEgcGFsYW5pIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FHTm15eFlwSGp6YmRGU0lnNW9BZ1JubktwRXBRdmJVTGNPZFd5S2JDTmJBPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Im5pdGh5YSIsImZhbWlseV9uYW1lIjoicGFsYW5pIiwiaWF0IjoxNjc3MjA2MTYzLCJleHAiOjE2NzcyMDk3NjMsImp0aSI6ImVmM2QzODZjNTg3NTJmMWM4ZTQ2YWVlOWM4NGRjOWIzNzEyMDExMGIifQ.xGBj9LFCORnD-O9kVt3rhlive9DRMvNO64vj2-iNstkQ3RcjPwjIbg_9wNR3iyPitKPQZoP94JoijwmYr9sxTo2hQxOoN5noSCyJyemJ1IgV9G5z2XQyDC7ap8yh2Sgufc0Au9E2zITu91_BkLfe55j5xK2nAP79atn75lG9UhSeg50QeGjJjDLOxTFi1Gg37npV0r-3DBFWuLLpxcWzEWAdicHr2tm9VfkUiG_hu4ifkkdNx4pPN67W28df3nt2QwNplxdCaS1GkakHivc9AkKF26gXGgzYOAPHcmJ7V_EyNR4Me8zAoA2twUb5Vk2oOLLmY03beL23ACR2iRKitQ';
      let type = 'login';
      const userData: GoogleSignup = decode(jwtToken) as GoogleSignup
      const authRoute = new AuthRoute();
      const userRepository = new Repository<UserEntity>();
      userRepository.findOne = jest.fn().mockReturnValue(null);
      userRepository.save = jest.fn().mockReturnValue({
        id: 2,
        email: userData.email,
        password: '',
        username: userData.name,
        userSource: 2
      });
      if (type == 'login') {
        const userLoginData: UserLogin = {
          email: userData.email,
          password: ''
        }
      }
      const app = new App([authRoute]);
      return request(app.getServer()).get(`${authRoute.path}auth/google/verify`).send(userData).expect(200);
    });
  });

});
