import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
const apiRoute = '/projects';

describe('[Project] Get All', () => {
  describe(`GET ${apiRoute}`, () => {
    let authToken: string;

    beforeAll(async () => {
      const testUser = await testHelper.createTestUser('Password1');
      authToken = testHelper.generateToken(testUser);
      await testHelper.createTestProject(testUser);
      await testHelper.createTestProject(testUser);
      await testHelper.createTestProject(testUser);
      await testHelper.createTestProject(testUser);
      await testHelper.createTestProject(testUser);
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

    it('should successfully return a list of projects', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, projects, page, itemsPerPage, totalPages, totalItems } =
            res.body;
          assert.strictEqual(message, 'project list has been successfully retrieved');
          assert.strictEqual(page, 1);
          assert.strictEqual(itemsPerPage, 10);
          assert(totalPages >= 1);
          assert(totalItems >= 5);
          assert(projects);
          assert(projects.length <= itemsPerPage);
          const project = projects[0];
          assert(project.id);
          assert(project.name);
          assert(project.description);
          assert(project.createdOn);
          done();
        });
    });
  });
});
