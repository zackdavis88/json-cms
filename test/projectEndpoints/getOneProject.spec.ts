import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId';

describe('[Project] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let authToken: string;
    let testProject: Project;
    let testUser: User;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(testUser);
      testProject = await testHelper.createTestProject(testUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}`;
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

    it('should reject requests that have an invalid project id', (done) => {
      apiRoute = '/projects/bad';
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'requested project id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the project is not found', (done) => {
      apiRoute = `/projects/${testHelper.generateUUID()}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should successfully return a project', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, project } = res.body;
          assert.strictEqual(message, 'project has been successfully retrieved');
          assert(project);
          assert.strictEqual(project.id, testProject.id);
          assert.strictEqual(project.name, testProject.name);
          assert.strictEqual(project.description, testProject.description);
          assert.strictEqual(project.createdOn, testProject.createdOn.toISOString());
          assert(project.createdBy);
          assert.strictEqual(project.createdBy.displayName, testUser.displayName);
          assert.strictEqual(project.createdBy.username, testUser.username);
          assert.strictEqual(project.membershipsCount, 1);
          done();
        });
    });
  });
});
