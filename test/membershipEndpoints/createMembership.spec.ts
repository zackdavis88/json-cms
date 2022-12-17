import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Membership, Project, User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/memberships';

interface CreatePayload {
  username?: unknown;
  isProjectAdmin?: unknown;
  isBlueprintManager?: unknown;
  isComponentManager?: unknown;
  isLayoutManager?: unknown;
  isFragmentManager?: unknown;
}

describe('[Membership] Create', () => {
  describe(`POST ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let notAuthorizedUser: User;
    let authToken: string;
    let notAuthorizedToken: string;
    let payload: CreatePayload;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      notAuthorizedUser = await testHelper.createTestUser();
      testProject = await testHelper.createTestProject(testUser);
      authToken = testHelper.generateToken(testUser);
      notAuthorizedToken = testHelper.generateToken(notAuthorizedUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/memberships`;
      payload = {
        username: notAuthorizedUser.username,
        isBlueprintManager: true,
        isComponentManager: true,
        isLayoutManager: true,
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

    it('should reject requests that have an invalid project id', (done) => {
      apiRoute = '/projects/wrong/memberships';
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'requested project id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the project is not found', (done) => {
      apiRoute = `/projects/${testHelper.generateUUID()}/memberships`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
        401,
        {
          error: 'you do not have permission to update this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests from users that do not have isProjectAdmin permissions', (done) => {
      testProject.createMembership({ userId: notAuthorizedUser.id }).then(() => {
        request(serverUrl).post(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
          401,
          {
            error: 'you do not have permission to update this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
      });
    });

    it('should reject requests when isProjectAdmin input, if provided, is not a boolean', (done) => {
      payload.isProjectAdmin = 'yes, please';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isProjectAdmin must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when isBlueprintManager input, if provided, is not a boolean', (done) => {
      payload.isBlueprintManager = 123456;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isBlueprintManager must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when isComponentManager input, if provided, is not a boolean', (done) => {
      payload.isComponentManager = 'do it';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isComponentManager must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when isLayoutManager input, if provided, is not a boolean', (done) => {
      payload.isLayoutManager = {};
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isLayoutManager must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when isFragmentManager input, if provided, is not a boolean', (done) => {
      payload.isFragmentManager = null;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isFragmentManager must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when username is missing', (done) => {
      payload.username = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'username is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when username is not a string', (done) => {
      payload.username = false;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'username must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when the requested user is not found', (done) => {
      payload.username = 'te$t';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'requested user not found',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when the requested user is already a member', (done) => {
      payload.username = notAuthorizedUser.username;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'membership already exists',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully create a membership', (done) => {
      Membership.destroy({ where: { userId: notAuthorizedUser.id } }).then(() => {
        request(serverUrl)
          .post(apiRoute)
          .set('x-auth-token', authToken)
          .send(payload)
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            const { message, membership } = res.body;
            assert.strictEqual(message, 'membership has been successfully created');
            assert(membership);
            assert(membership.id);
            assert(membership.user);
            assert.strictEqual(membership.user.username, notAuthorizedUser.username);
            assert.strictEqual(
              membership.user.displayName,
              notAuthorizedUser.displayName,
            );
            assert(membership.project);
            assert.strictEqual(membership.project.id, testProject.id);
            assert.strictEqual(membership.project.name, testProject.name);
            assert.strictEqual(membership.isProjectAdmin, false);
            assert.strictEqual(membership.isBlueprintManager, payload.isBlueprintManager);
            assert.strictEqual(membership.isComponentManager, payload.isComponentManager);
            assert.strictEqual(membership.isLayoutManager, payload.isLayoutManager);
            assert.strictEqual(membership.isFragmentManager, false);
            done();
          });
      });
    });
  });
});
