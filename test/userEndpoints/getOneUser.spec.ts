import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/users/:username';

describe('[User] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let testUser: User;
    let authToken: string;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      apiRoute = `/users/${testUser.username}`;
      const authTokenUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(authTokenUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).get(apiRoute).expect(
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
        .get(`${apiRoute}$impossible`)
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

    it('should successfully return a user', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, user } = res.body;
          assert.strictEqual(message, 'user has been successfully retrieved');
          assert(user);
          assert.strictEqual(user.displayName, testUser.displayName);
          assert.strictEqual(user.username, testUser.username);
          assert.strictEqual(user.createdOn, testUser.createdOn.toISOString());
          done();
        });
    });
  });
});
