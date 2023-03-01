import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User, Blueprint, BlueprintVersion, Component } from '../../src/models';
import { componentCreatePayload, componentBlueprintPayload } from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/components/:componentId';

describe('[Component] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let notAuthorizedUser: User;
    let testBlueprint: Blueprint;
    let deletedTestComponent: Component;
    let authToken: string;
    let notAuthorizedToken: string;
    let testBlueprintVersion: BlueprintVersion;
    let testComponent: Component;
    let testComponentWithBlueprintVersion: Component;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      notAuthorizedUser = await testHelper.createTestUser();
      testProject = await testHelper.createTestProject(testUser);
      testBlueprint = await testProject.createBlueprint({
        ...componentBlueprintPayload,
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
      testComponent = await testProject.createComponent({
        ...componentCreatePayload,
        name: testHelper.generateUUID(),
        blueprintId: testBlueprint.id,
        createdById: testUser.id,
        updatedOn: new Date(),
        updatedById: notAuthorizedUser.id,
      });
      testComponentWithBlueprintVersion = await testProject.createComponent({
        ...componentCreatePayload,
        name: testHelper.generateUUID(),
        blueprintId: testBlueprint.id,
        blueprintVersionId: testBlueprintVersion.id,
        blueprintIsCurrent: false,
        createdById: testUser.id,
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
      apiRoute = `/projects/wrong/components/${testComponent.id}`;
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
      apiRoute = `/projects/${testHelper.generateUUID()}/components/${testComponent.id}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested component not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).get(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
        401,
        {
          error: 'you do not have permission to read components',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should successfully return a component', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, component } = res.body;
          assert.strictEqual(message, 'component has been successfully retrieved');
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
          assert.strictEqual(createdBy.displayName, testUser.displayName);
          assert.strictEqual(createdBy.username, testUser.username);

          const { updatedBy } = component;
          assert(updatedBy);
          assert.strictEqual(updatedBy.displayName, notAuthorizedUser.displayName);
          assert.strictEqual(updatedBy.username, notAuthorizedUser.username);

          const { blueprint } = component;
          assert(blueprint);
          assert.strictEqual(blueprint.id, testBlueprint.id);
          assert.strictEqual(blueprint.name, testBlueprint.name);
          assert.strictEqual(blueprint.version, testBlueprint.version);
          assert.strictEqual(blueprint.isCurrent, true);
          done();
        });
    });

    it('should successfully return blueprint version data if present', (done) => {
      apiRoute = `/projects/${testProject.id}/components/${testComponentWithBlueprintVersion.id}`;
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, component } = res.body;
          assert.strictEqual(message, 'component has been successfully retrieved');
          assert(component);
          assert.strictEqual(component.id, testComponentWithBlueprintVersion.id);
          assert.strictEqual(component.name, testComponentWithBlueprintVersion.name);
          assert.deepStrictEqual(
            component.content,
            testComponentWithBlueprintVersion.content,
          );
          assert.strictEqual(
            component.createdOn,
            testComponentWithBlueprintVersion.createdOn.toISOString(),
          );
          assert.strictEqual(
            component.updatedOn,
            testComponentWithBlueprintVersion.updatedOn?.toISOString(),
          );

          const { project } = component;
          assert(project);
          assert.strictEqual(project.id, testProject.id);
          assert.strictEqual(project.name, testProject.name);

          const { createdBy } = component;
          assert(createdBy);
          assert.strictEqual(createdBy.displayName, testUser.displayName);
          assert.strictEqual(createdBy.username, testUser.username);

          const { updatedBy } = component;
          assert(updatedBy);
          assert.strictEqual(updatedBy.displayName, notAuthorizedUser.displayName);
          assert.strictEqual(updatedBy.username, notAuthorizedUser.username);

          const { blueprint } = component;
          assert(blueprint);
          assert.strictEqual(blueprint.id, testBlueprint.id);
          assert.strictEqual(blueprint.name, testBlueprintVersion.name);
          assert.strictEqual(blueprint.version, testBlueprintVersion.version);
          assert.strictEqual(blueprint.isCurrent, false);
          done();
        });
    });
  });
});
