import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
const apiRoute = '/auth/token';

describe('[Auth] Authenticate Token', () => {
  describe(`GET ${apiRoute}`, () => {
    let testUser: User;
    const testPassword = 'Password:1:';

    beforeAll(async () => {
      testUser = await testHelper.createTestUser(testPassword);
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

    it('should reject requests when x-auth-token is expired', (done) => {
      const tokenOverrides = {
        iat: Math.floor(Date.now() / 1000) - 60 * 61 * 10,
        exp: Math.floor(Date.now() / 1000),
      };
      const jwtToken = testHelper.generateToken(testUser, tokenOverrides);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        400,
        {
          error: 'x-auth-token is expired',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when x-auth-token is encrypted with the wrong secret key', (done) => {
      // A Token is invalid when it has been encrypted using the wrong secret-key.
      const secretOverride = 'badSecret';
      const jwtToken = testHelper.generateToken(testUser, {}, secretOverride);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        400,
        {
          error: 'x-auth-token is invalid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when x-auth-token is invalid', (done) => {
      const jwtToken = testHelper.generateToken(testUser, 'some string value');
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        400,
        {
          error: 'x-auth-token is invalid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when x-auth-token does not contain expected fields', (done) => {
      const tokenOverrides = { apiKey: undefined };
      const jwtToken = testHelper.generateToken(testUser, tokenOverrides);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        400,
        {
          error: 'x-auth-token is missing required fields',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the x-auth-token apiKey is not a uuid', (done) => {
      const tokenOverrides = { apiKey: 'something-wrong-and-bad' };
      const jwtToken = testHelper.generateToken(testUser, tokenOverrides);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        400,
        {
          error: 'x-auth-token contains an invalid value',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the x-auth-token id is not a uuid', (done) => {
      const tokenOverrides = { id: 'impossibleId' };
      const jwtToken = testHelper.generateToken(testUser, tokenOverrides);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        400,
        {
          error: 'x-auth-token contains an invalid value',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the x-auth-token apiKey is wrong', (done) => {
      const tokenOverrides = { apiKey: testHelper.generateUUID() };
      const jwtToken = testHelper.generateToken(testUser, tokenOverrides);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        403,
        {
          error: 'x-auth-token user could not be authenticated',
          errorType: ErrorTypes.AUTHENTICATION,
        },
        done,
      );
    });

    it('should reject requests when the x-auth-token id is wrong', (done) => {
      const tokenOverrides = { id: testHelper.generateUUID() };
      const jwtToken = testHelper.generateToken(testUser, tokenOverrides);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        403,
        {
          error: 'x-auth-token user could not be authenticated',
          errorType: ErrorTypes.AUTHENTICATION,
        },
        done,
      );
    });

    it('should successfully authenticate a token', (done) => {
      const jwtToken = testHelper.generateToken(testUser);
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', jwtToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, user } = res.body;
          assert.strictEqual(message, 'user successfully authenticated via token');
          assert(user);
          assert.strictEqual(user.username, testUser.username);
          assert.strictEqual(user.displayName, testUser.displayName);
          assert(user.createdOn);
          done();
        });
    });
  });
});
