import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User, Blueprint, Component } from '../../src/models';
import { componentCreatePayload, componentBlueprintPayload } from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/components/:componentId';

interface RemovePayload {
  confirm?: unknown;
}

describe('[Component] Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let testBlueprint: Blueprint;
    let authToken: string;
    let notAuthorizedUser: User;
    let notAuthorizedToken: string;
    let testComponent: Component;
    let deletedTestComponent: Component;
    let payload: RemovePayload;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      notAuthorizedUser = await testHelper.createTestUser();
      testProject = await testHelper.createTestProject(testUser);
      testBlueprint = await testProject.createBlueprint({
        ...componentBlueprintPayload,
        name: testHelper.generateUUID(),
        version: 113,
        createdById: testUser.id,
        updatedOn: new Date(),
        updatedById: testUser.id,
      });
      testComponent = await testProject.createComponent({
        ...componentCreatePayload,
        name: testHelper.generateUUID(),
        blueprintId: testBlueprint.id,
        createdById: notAuthorizedUser.id,
        updatedOn: new Date(),
        updatedById: notAuthorizedUser.id,
      });
      deletedTestComponent = await testProject.createComponent({
        ...componentCreatePayload,
        name: testHelper.generateUUID(),
        blueprintId: testBlueprint.id,
        blueprintIsCurrent: true,
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
      apiRoute = `/projects/${testProject.id}/components/${testComponent.id}`;
      payload = {
        confirm: testComponent.name,
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
      apiRoute = `/projects/wrong/components/${testComponent.id}`;
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
      apiRoute = `/projects/${testHelper.generateUUID()}/components/${testComponent.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests that have an invalid component id', (done) => {
      apiRoute = `/projects/${testProject.id}/components/badId`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'requested component id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the component is not found', (done) => {
      apiRoute = `/projects/${testProject.id}/components/${testHelper.generateUUID()}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested component not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the component has been deleted', (done) => {
      apiRoute = `/projects/${testProject.id}/components/${deletedTestComponent.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested component not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
        401,
        {
          error: 'you do not have permission to manage components',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests from users that do not have isComponentManager permissions', (done) => {
      testProject.createMembership({ userId: notAuthorizedUser.id }).then(() => {
        request(serverUrl)
          .delete(apiRoute)
          .set('x-auth-token', notAuthorizedToken)
          .expect(
            401,
            {
              error: 'you do not have permission to manage components',
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

    it('should reject requests when confirm does not match the components name', (done) => {
      payload.confirm = 'ThisIsWrong';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: `confirm input must have a value of ${testComponent.name}`,
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully remove a component', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, component } = res.body;
          assert.strictEqual(message, 'component has been successfully removed');
          assert(component);
          assert.strictEqual(component.id, testComponent.id);
          assert.strictEqual(component.name, testComponent.name);
          assert.deepStrictEqual(component.content, testComponent.content);
          assert.strictEqual(component.createdOn, testComponent.createdOn.toISOString());
          assert.strictEqual(component.updatedOn, testComponent.updatedOn?.toISOString());

          const { project } = component;
          assert(project);
          assert.strictEqual(project.id, testProject.id);
          assert.strictEqual(project.name, testProject.name);

          const { createdBy } = component;
          assert(createdBy);
          assert.strictEqual(createdBy.displayName, notAuthorizedUser.displayName);
          assert.strictEqual(createdBy.username, notAuthorizedUser.username);

          const { updatedBy } = component;
          assert(updatedBy);
          assert.strictEqual(updatedBy.displayName, notAuthorizedUser.displayName);
          assert.strictEqual(updatedBy.username, notAuthorizedUser.username);

          const { deletedBy } = component;
          assert(deletedBy);
          assert.strictEqual(deletedBy.displayName, testUser.displayName);
          assert.strictEqual(deletedBy.username, testUser.username);

          const { blueprint } = component;
          assert(blueprint);
          assert.strictEqual(blueprint.id, testBlueprint.id);
          assert.strictEqual(blueprint.name, testBlueprint.name);
          assert.strictEqual(blueprint.version, testBlueprint.version);
          assert.strictEqual(blueprint.isCurrent, true);

          // Validate that isActive is set to false in the database.
          Component.findOne({ where: { id: testComponent.id } }).then(
            (componentInDatabase) => {
              if (!componentInDatabase) {
                return done('component not found');
              }
              assert.strictEqual(
                component.deletedOn,
                componentInDatabase.deletedOn?.toISOString(),
              );
              assert.strictEqual(componentInDatabase.isActive, false);
              done();
            },
          );
        });
    });
  });
});
