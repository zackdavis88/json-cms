import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
const apiRoute = '/users';

describe('[User] Get All', () => {
  describe(`GET ${apiRoute}`, () => {
    let testUser: User;
    let authToken: string;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser('Password1');
      await testHelper.createTestUser('Password2');
      await testHelper.createTestUser('Password3');
      await testHelper.createTestUser('Password4');
      authToken = testHelper.generateToken(testUser);
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

    it('should successfully return a list of users', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, users, page, itemsPerPage, totalPages, totalItems } = res.body;
          assert.strictEqual(message, 'user list has been successfully retrieved');
          assert.strictEqual(page, 1);
          assert.strictEqual(itemsPerPage, 10);
          assert(totalPages >= 1);
          assert(totalItems >= 4);
          assert(users);
          assert(users.length);
          const user = users[0];
          assert(user.username);
          assert(user.displayName);
          assert(user.createdOn);
          assert(!user._id);
          assert(!user.hash);
          assert(!user.apiKey);
          done();
        });
    });
  });
});
