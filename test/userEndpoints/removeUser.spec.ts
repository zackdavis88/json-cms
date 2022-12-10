import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/users/:username';

interface RemovePayload {
  confirm?: unknown;
}

describe('[User] Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let authTokenUser: User;
    let testUser: User;
    let authToken: string;
    let payload: RemovePayload;

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
        confirm: authTokenUser.username,
      };
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).delete(apiRoute).expect(
        400,
        {
          error: 'x-auth-token header is missing from input',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should not allow users to remove other user accounts', (done) => {
      apiRoute = `/users/${testUser.username}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        401,
        {
          error: 'you do not have permission to perform this action',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when confirm is missing', (done) => {
      payload.confirm = undefined;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when confirm is not a string', (done) => {
      payload.confirm = true;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when confirm does not match username', (done) => {
      payload.confirm = '$omethingWrong';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: `confirm input must have a value of ${authTokenUser.username}`,
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully remove a user', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, user } = res.body;
          assert.strictEqual(message, 'user has been successfully removed');
          assert(user);
          assert.strictEqual(user.username, authTokenUser.username);
          assert.strictEqual(user.displayName, authTokenUser.displayName);
          assert.strictEqual(user.createdOn, authTokenUser.createdOn.toISOString());

          // Validate that isActive is set to false in the database.
          User.findOne({ where: { username: authTokenUser.username } }).then(
            (userInDatabase) => {
              if (!userInDatabase) return done('user not found');
              assert.strictEqual(user.deletedOn, userInDatabase.deletedOn?.toISOString());
              assert.strictEqual(userInDatabase.isActive, false);
              done();
            },
          );
        });
    });
  });
});
