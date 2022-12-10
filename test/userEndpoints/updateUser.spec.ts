import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/users/:username';

interface UpdatePayload {
  password?: unknown;
}

describe('[User] Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let authTokenUser: User;
    let testUser: User;
    let authToken: string;
    let payload: UpdatePayload;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      authTokenUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(authTokenUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/users/${authTokenUser.username}`;
      payload = {
        password: '$om3th1ngValid!',
      };
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).post(apiRoute).expect(
        400,
        {
          error: 'x-auth-token header is missing from input',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the user is not found', (done) => {
      // adding $impossible to the url should work because a valid user
      // cannot have special characters in its username
      request(serverUrl)
        .post(`${apiRoute}$impossible`)
        .set('x-auth-token', authToken)
        .expect(
          404,
          {
            error: 'requested user not found',
            errorType: ErrorTypes.NOT_FOUND,
          },
          done,
        );
    });

    it('should not allow users to update other user accounts', (done) => {
      apiRoute = `/users/${testUser.username}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        401,
        {
          error: 'you do not have permission to perform this action',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when password is missing', (done) => {
      payload.password = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when password is not a string', (done) => {
      payload.password = { something: 'wrong' };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when password is less than 8 characters', (done) => {
      payload.password = 'short';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password must be at least 8 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when password has no uppercase characters', (done) => {
      payload.password = 'password1';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password must have 1 uppercase, lowercase, and number character',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when password has no lowercase characters', (done) => {
      payload.password = 'PASSWORD1';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password must have 1 uppercase, lowercase, and number character',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when password has no number characters', (done) => {
      payload.password = 'Password_One';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password must have 1 uppercase, lowercase, and number character',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully update a users password', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, user } = res.body;
          assert.strictEqual(message, 'user password has been successfully updated');
          assert(user);
          assert.strictEqual(user.displayName, authTokenUser.displayName);
          assert.strictEqual(user.username, authTokenUser.username);
          assert.strictEqual(user.createdOn, authTokenUser.createdOn.toISOString());
          assert(user.updatedOn);

          // Check that the new password is actually working.
          User.findOne({ where: { username: authTokenUser.username } }).then((user) => {
            if (!user) return done('user not found');

            const passwordIsValid = user.compareHash(payload.password as string);
            assert.strictEqual(passwordIsValid, true);
            done();
          });
        });
    });
  });
});
