import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User, Blueprint } from '../../src/models';
import { blueprintCreatePayload } from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/blueprints';

describe('[Blueprint] Get All', () => {
  describe(`GET ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let testBlueprint: Blueprint;
    let authToken: string;
    let notAuthorizedToken: string;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      const notAuthorizedUser = await testHelper.createTestUser();
      testProject = await testHelper.createTestProject(testUser);
      await testProject.createBlueprint({
        ...blueprintCreatePayload,
        name: testHelper.generateUUID(),
        version: 1,
        createdById: testUser.id,
      });
      await testProject.createBlueprint({
        ...blueprintCreatePayload,
        name: testHelper.generateUUID(),
        version: 6,
        createdById: testUser.id,
      });
      await testProject.createBlueprint({
        ...blueprintCreatePayload,
        name: testHelper.generateUUID(),
        version: 12,
        createdById: testUser.id,
      });
      await testProject.createBlueprint({
        ...blueprintCreatePayload,
        name: testHelper.generateUUID(),
        version: 1,
        createdById: testUser.id,
      });
      testBlueprint = await testProject.createBlueprint({
        ...blueprintCreatePayload,
        name: testHelper.generateUUID(),
        version: 9,
        createdById: testUser.id,
        updatedOn: new Date(),
        updatedById: testUser.id,
      });
      await testProject.createBlueprint({
        ...blueprintCreatePayload,
        name: testHelper.generateUUID(),
        version: 155,
        createdById: testUser.id,
      });
      await testProject.createBlueprint({
        ...blueprintCreatePayload,
        name: testHelper.generateUUID(),
        version: 1,
        createdById: testUser.id,
      });
      authToken = testHelper.generateToken(testUser);
      notAuthorizedToken = testHelper.generateToken(notAuthorizedUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/blueprints`;
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
      apiRoute = '/projects/wrong/blueprints';
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
      apiRoute = `/projects/${testHelper.generateUUID()}/blueprints`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).get(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
        401,
        {
          error: 'you do not have permission to read blueprints',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should successfully return a list of blueprints', (done) => {
      apiRoute = `${apiRoute}?itemsPerPage=4&page=2`;
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const {
            message,
            blueprints,
            project,
            page,
            totalItems,
            totalPages,
            itemsPerPage,
          } = res.body;
          assert.strictEqual(message, 'blueprint list has been successfully retrieved');
          assert(project);
          assert.strictEqual(project.id, testProject.id);
          assert.strictEqual(project.name, testProject.name);
          assert.strictEqual(page, 2);
          assert.strictEqual(totalItems, 7);
          assert.strictEqual(totalPages, 2);
          assert.strictEqual(itemsPerPage, 4);
          assert.strictEqual(blueprints.length, 3);

          const blueprint = blueprints[0];
          assert.strictEqual(blueprint.id, testBlueprint.id);
          assert.strictEqual(blueprint.name, testBlueprint.name);
          assert.strictEqual(blueprint.version, testBlueprint.version);
          assert.strictEqual(blueprint.createdOn, testBlueprint.createdOn.toISOString());
          assert(blueprint.createdBy);
          assert.strictEqual(blueprint.createdBy.displayName, testUser.displayName);
          assert.strictEqual(blueprint.createdBy.username, testUser.username);

          assert.strictEqual(blueprint.updatedOn, testBlueprint.updatedOn?.toISOString());
          assert(blueprint.updatedBy);
          assert.strictEqual(blueprint.updatedBy.displayName, testUser.displayName);
          assert.strictEqual(blueprint.updatedBy.username, testUser.username);
          done();
        });
    });
  });
});
