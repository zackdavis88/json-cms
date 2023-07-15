import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User, Blueprint } from '../../src/models';
import { blueprintCreatePayload } from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/blueprints/:blueprintId';

interface RemovePayload {
  confirm?: unknown;
}

describe('[Blueprint] Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let testBlueprint: Blueprint;
    let authToken: string;
    let notAuthorizedUser: User;
    let notAuthorizedToken: string;
    let payload: RemovePayload;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      notAuthorizedUser = await testHelper.createTestUser();
      testProject = await testHelper.createTestProject(testUser);
      testBlueprint = await testProject.createBlueprint({
        ...blueprintCreatePayload,
        name: testHelper.generateUUID(),
        version: 9,
        createdById: testUser.id,
        updatedOn: new Date(),
        updatedById: testUser.id,
      });
      authToken = testHelper.generateToken(testUser);
      notAuthorizedToken = testHelper.generateToken(notAuthorizedUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/blueprints/${testBlueprint.id}`;
      payload = {
        confirm: testBlueprint.name,
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

    it('should reject requests that have an invalid project id', (done) => {
      apiRoute = `/projects/wrong/blueprints/${testBlueprint.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested blueprint not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
        401,
        {
          error: 'you do not have permission to manage blueprints',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests from users that do not have isBlueprintManager permissions', (done) => {
      testProject.createMembership({ userId: notAuthorizedUser.id }).then(() => {
        request(serverUrl)
          .delete(apiRoute)
          .set('x-auth-token', notAuthorizedToken)
          .expect(
            401,
            {
              error: 'you do not have permission to manage blueprints',
              errorType: ErrorTypes.AUTHORIZATION,
            },
            done,
          );
      });
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
      payload.confirm = { do: 'it' };
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

    it('should reject requests when confirm does not match the blueprints name', (done) => {
      payload.confirm = 'ThisIsWrong';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: `confirm input must have a value of ${testBlueprint.name}`,
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully remove a blueprint', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, blueprint } = res.body;
          assert.strictEqual(message, 'blueprint has been successfully removed');
          assert(blueprint);
          assert.strictEqual(blueprint.id, testBlueprint.id);
          assert.strictEqual(blueprint.name, testBlueprint.name);
          assert.strictEqual(blueprint.version, testBlueprint.version);

          assert(blueprint.project);
          assert.strictEqual(blueprint.project.id, testProject.id);
          assert.strictEqual(blueprint.project.name, testProject.name);

          assert.strictEqual(blueprint.createdOn, testBlueprint.createdOn.toISOString());
          assert(blueprint.createdBy);
          assert.strictEqual(blueprint.createdBy.displayName, testUser.displayName);
          assert.strictEqual(blueprint.createdBy.username, testUser.username);

          assert(blueprint.updatedOn);
          assert(blueprint.updatedBy);
          assert.strictEqual(blueprint.updatedBy.displayName, testUser.displayName);
          assert.strictEqual(blueprint.updatedBy.username, testUser.username);

          // Validate that isActive is set to false in the database.
          Blueprint.findOne({ where: { id: testBlueprint.id } }).then(
            (blueprintInDatabase) => {
              if (!blueprintInDatabase) {
                return done('blueprint not found');
              }
              assert.strictEqual(
                blueprint.deletedOn,
                blueprintInDatabase.deletedOn?.toISOString(),
              );
              assert.strictEqual(blueprintInDatabase.isActive, false);
              done();
            },
          );
        });
    });
  });
});
