import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User, Blueprint, BlueprintVersion } from '../../src/models';
import { blueprintCreatePayload } from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/blueprints/:blueprintId';

describe('[Blueprint] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let testBlueprint: Blueprint;
    let deletedTestBlueprint: Blueprint;
    let authToken: string;
    let notAuthorizedToken: string;
    let testBlueprintVersion: BlueprintVersion;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      const notAuthorizedUser = await testHelper.createTestUser();
      testProject = await testHelper.createTestProject(testUser);
      testBlueprint = await testProject.createBlueprint({
        ...blueprintCreatePayload,
        name: testHelper.generateUUID(),
        version: 9,
        createdById: testUser.id,
        updatedOn: new Date(),
        updatedById: testUser.id,
      });
      testBlueprintVersion = await testBlueprint.createVersion({
        version: 8,
        name: 'the name of the blueprint in the past',
        fields: [
          {
            name: 'aFieldFromThePast',
            type: 'STRING',
          },
        ],
      });
      deletedTestBlueprint = await testProject.createBlueprint({
        ...blueprintCreatePayload,
        name: testHelper.generateUUID(),
        version: 100,
        createdById: testUser.id,
        updatedOn: new Date(),
        updatedById: testUser.id,
        isActive: false,
      });
      authToken = testHelper.generateToken(testUser);
      notAuthorizedToken = testHelper.generateToken(notAuthorizedUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/blueprints/${testBlueprint.id}`;
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
      apiRoute = `/projects/wrong/blueprints/${testBlueprint.id}`;
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
      apiRoute = `/projects/${testHelper.generateUUID()}/blueprints/${testBlueprint.id}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests that have an invalid blueprint id', (done) => {
      apiRoute = `/projects/${testProject.id}/blueprints/badId`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'requested blueprint id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the blueprint is not found', (done) => {
      apiRoute = `/projects/${testProject.id}/blueprints/${testHelper.generateUUID()}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested blueprint not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the blueprint has been deleted', (done) => {
      apiRoute = `/projects/${testProject.id}/blueprints/${deletedTestBlueprint.id}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested blueprint not found',
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

    it('should successfully return a blueprint', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, blueprint } = res.body;
          assert.strictEqual(message, 'blueprint has been successfully retrieved');
          assert(blueprint);
          assert.strictEqual(blueprint.id, testBlueprint.id);
          assert.strictEqual(blueprint.name, testBlueprint.name);
          assert.strictEqual(blueprint.createdOn, testBlueprint.createdOn.toISOString());
          assert(blueprint.createdBy);
          assert.strictEqual(blueprint.createdBy.username, testUser.username);
          assert.strictEqual(blueprint.createdBy.displayName, testUser.displayName);

          assert.strictEqual(blueprint.updatedOn, testBlueprint.updatedOn?.toISOString());
          assert(blueprint.updatedBy);
          assert.strictEqual(blueprint.updatedBy.username, testUser.username);
          assert.strictEqual(blueprint.updatedBy.displayName, testUser.displayName);

          assert(blueprint.fields);
          assert(Array.isArray(blueprint.fields));
          assert.strictEqual(blueprint.fields.length, testBlueprint.fields.length);
          assert.deepEqual(blueprint.fields, blueprintCreatePayload.fields);
          assert.strictEqual(blueprint.version, 9);
          done();
        });
    });

    it('should successfully return an older blueprint version', (done) => {
      apiRoute = `${apiRoute}?version=8`;
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, blueprint } = res.body;
          assert.strictEqual(message, 'blueprint has been successfully retrieved');
          assert(blueprint);
          assert.strictEqual(blueprint.id, testBlueprint.id);
          assert.strictEqual(blueprint.name, testBlueprintVersion.name);
          assert.strictEqual(blueprint.createdOn, testBlueprint.createdOn.toISOString());
          assert(blueprint.createdBy);
          assert.strictEqual(blueprint.createdBy.username, testUser.username);
          assert.strictEqual(blueprint.createdBy.displayName, testUser.displayName);

          assert.strictEqual(blueprint.updatedOn, testBlueprint.updatedOn?.toISOString());
          assert(blueprint.updatedBy);
          assert.strictEqual(blueprint.updatedBy.username, testUser.username);
          assert.strictEqual(blueprint.updatedBy.displayName, testUser.displayName);

          assert(blueprint.fields);
          assert(Array.isArray(blueprint.fields));
          assert.strictEqual(blueprint.fields.length, testBlueprintVersion.fields.length);
          assert.deepEqual(blueprint.fields, testBlueprintVersion.fields);
          assert.strictEqual(blueprint.version, 8);
          done();
        });
    });
  });
});
