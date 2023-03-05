import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Membership, User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
const apiRoute = '/projects';

interface CreatePayload {
  name?: unknown;
  description?: unknown;
}

describe('[Project] Create', () => {
  describe(`POST ${apiRoute}`, () => {
    let authToken: string;
    let payload: CreatePayload;
    let testUser: User;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(testUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      payload = {
        name: testHelper.generateUUID().slice(0, 11), // slicing because name maximum is 30 chars.
        description: 'project generated by unit testing createProject',
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

    it('should reject requests when name is missing', (done) => {
      payload.name = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is not a string', (done) => {
      payload.name = { something: 'wrong' };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is less than 3 characters', (done) => {
      payload.name = 'no';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 3 - 30 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is more than 30 characters', (done) => {
      payload.name = Array(31).fill('a').join('');
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 3 - 30 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name contains invalid characters', (done) => {
      payload.name = '[this is probably invalid]';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name contains invalid characters',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when description is not a string', (done) => {
      payload.description = false;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'description must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when description is more than 350 characters', (done) => {
      payload.description = Array(351).fill('a').join('');
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'description must be 350 characters or less',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully create a project', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, project } = res.body;
          assert.strictEqual(message, 'project has been successfully created');
          assert(project);
          assert(project.id);
          assert.strictEqual(project.name, payload.name);
          assert.strictEqual(project.description, payload.description);
          assert(project.createdOn);
          assert(project.createdBy);
          assert.strictEqual(project.createdBy.displayName, testUser.displayName);
          assert.strictEqual(project.createdBy.username, testUser.username);
          testHelper.addTestProjectId(project.id);

          // Validate that a new membership was created for the user performing the request.
          Membership.findAll({
            where: {
              userId: testUser.id,
              projectId: project.id,
            },
          }).then((memberships) => {
            assert(memberships); // memberships is an Array (findAll).
            assert.strictEqual(memberships.length, 1);

            const membership = memberships[0];
            assert(membership.id);
            assert.strictEqual(membership.isProjectAdmin, true);
            assert(membership.createdOn);
            done();
          });
        });
    });
  });
});
