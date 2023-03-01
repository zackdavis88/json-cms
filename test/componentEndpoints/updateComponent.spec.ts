/* eslint-disable quotes */
import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User, Blueprint, BlueprintVersion, Component } from '../../src/models';
import {
  componentCreatePayload,
  componentBlueprintPayload,
  componentUpdatePayload,
} from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/components/:componentId';

interface UpdateComponentPayload {
  name: unknown;
  content: unknown;
}

describe('[Component] Update', () => {
  describe(`POST ${apiRoute}`, () => {
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
    let payload: UpdateComponentPayload;

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
        createdById: notAuthorizedUser.id,
        updatedOn: new Date(),
        updatedById: notAuthorizedUser.id,
      });
      testComponentWithBlueprintVersion = await testProject.createComponent({
        content: {
          aFieldFromThePast: 'hello, world!',
        },
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
      payload = { ...componentUpdatePayload };
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
      apiRoute = `/projects/wrong/components/${testComponent.id}`;
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
      apiRoute = `/projects/${testHelper.generateUUID()}/components/${testComponent.id}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested component not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
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
        request(serverUrl).post(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
          401,
          {
            error: 'you do not have permission to manage components',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
      });
    });

    it('should reject requests when there is no update input', (done) => {
      payload = { name: undefined, content: undefined };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'input contains no update data',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is not a string', (done) => {
      payload.name = 712389745;
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

    it('should reject requests when name is less than 1 character', (done) => {
      payload.name = '';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 1 - 100 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is more than 100 characters', (done) => {
      payload.name = Array(101).fill('a').join('');
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 1 - 100 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name contains invalid characters', (done) => {
      payload.name = 'abc-_+=&^%$#@!/|{}()?.,<>;\':"*]';
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

    it('should reject requests when content is not an object', (done) => {
      payload.content = '';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error:
              'content must be an object of key/values following the blueprint fields',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a required content value is missing', (done) => {
      payload.content = { heroPanel: {} };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "heroPanel field 'headingText' is a required object",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when string content is not a string', (done) => {
      payload.content = { heroPanel: { headingText: { mobile: false } } };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "headingText field 'mobile' must be a string",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when string content does not match optional regex', (done) => {
      payload.content = {
        heroPanel: { headingText: { desktop: 'not valid' } },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error:
              "headingText field 'desktop' must match the blueprint regex /^desktop/",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when string content length is less than the optional minimum', (done) => {
      payload.content = {
        heroPanel: { headingText: { tablet: 'abcd' } },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "headingText field 'tablet' must have a minimum length of 5",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when string content length is more than the optional maximum', (done) => {
      payload.content = {
        heroPanel: { headingText: { tablet: new Array(51).fill('a').join('') } },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "headingText field 'tablet' must have a maximum length of 50",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when boolean content is not a boolean', (done) => {
      payload.content = {
        heroPanel: { headingText: {}, timer: { hideTimer: 'false' } },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "timer field 'hideTimer' must be a boolean",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when number content is not a number', (done) => {
      payload.content = {
        heroPanel: { headingText: {}, totalSold: false },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "heroPanel field 'totalSold' must be a number",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when number content is not an integer when specified', (done) => {
      payload.content = {
        heroPanel: { headingText: {}, totalSold: 0.4 },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "heroPanel field 'totalSold' must be an integer",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when number content is less than the optional minimum', (done) => {
      payload.content = {
        heroPanel: { headingText: {}, totalSold: 5 },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "heroPanel field 'totalSold' must have a minimum value of 10",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when number content is more than the optional maximum', (done) => {
      payload.content = {
        heroPanel: { headingText: {}, totalSold: 500000 },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "heroPanel field 'totalSold' must have a maximum value of 100000",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when date content is not a string', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          timer: { startTime: new Date().toISOString(), endTime: 45678123 },
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "timer field 'endTime' must be a timestamp string",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when date content is not a valid date', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          timer: { startTime: new Date().toISOString(), endTime: '' },
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "timer field 'endTime' must be a valid date",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when object content is not an object', (done) => {
      payload.content = {
        heroPanel: {
          headingText: true,
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "heroPanel field 'headingText' must be an object",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when array content is not an array', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          styles: {
            desktopStyles: {},
          },
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "styles field 'desktopStyles' must be an array",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when array content is less than the optional minimum', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          stringArray: [],
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "heroPanel field 'stringArray' must have a minimum length of 1",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when array content is more than the optional maximum', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          stringArray: ['one', 'two', 'three', 'four', 'five', 'six'],
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "heroPanel field 'stringArray' must have a maximum length of 5",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when string-array content is not a string', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          stringArray: [66, 55, 123],
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "stringArray array field 'item' must be a string",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when string-array content does not match optional regex', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          stringArray: ['wads'],
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "stringArray array field 'item' must match the blueprint regex /^a_/",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when string-array content is less than the optional minimum', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          stringArray: ['a_wads', 'a_'],
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "stringArray array field 'item' must have a minimum length of 3",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when string-array content is more than the optional maximum', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          stringArray: ['a_wads', 'a_wadswadswads'],
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "stringArray array field 'item' must have a maximum length of 10",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when boolean-array content is not a boolean', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          booleanArray: [true, 'false'],
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "booleanArray array field 'item' must be a boolean",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when number-array content is not a number', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
        },
        numberArray: ['999'],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "numberArray array field 'item' must be a number",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when number-array content is not an integer when specified', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          integerArray: [1, 2, 3.14],
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "integerArray array field 'item' must be an integer",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when number-array content is less than the optional minimum', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
        },
        numberArray: [-5],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "numberArray array field 'item' must have a minimum value of 0.6",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when number-array content is more than the optional maximum', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
        },
        numberArray: [7, 60.59, 99.8],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "numberArray array field 'item' must have a maximum value of 60.59",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when date-array content is not a timestamp string', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
        },
        dateArray: [1564789123],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "dateArray array field 'item' must be a timestamp string",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when date-array content is not a valid date', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
        },
        dateArray: ['not_a_date'],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "dateArray array field 'item' must be a valid date",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when object-array content is not a valid object', (done) => {
      payload.content = {
        heroPanel: {
          headingText: {},
          styles: {
            desktopStyles: ['not_an_object'],
          },
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "desktopStyles array field 'item' must be an object",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests where content contains no valid fields', (done) => {
      payload.name = undefined;
      payload.content = {
        somethingNotInTheBlueprint:
          'when we sanitize content data, this will be removed.',
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content contains no valid fields',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should use blueprintVersion fields if present for content validation', (done) => {
      apiRoute = `/projects/${testProject.id}/components/${testComponentWithBlueprintVersion.id}`;
      payload.name = undefined;
      payload.content = {
        aFieldFromThePast: {
          invalid: true,
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: "content field 'aFieldFromThePast' must be a string",
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully update a component', (done) => {
      apiRoute = `/projects/${testProject.id}/components/${testComponent.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, component } = res.body;
          assert.strictEqual(message, 'component has been successfully updated');
          assert(component);
          assert.strictEqual(component.id, testComponent.id);
          assert.strictEqual(component.name, payload.name);
          assert.deepStrictEqual(component.content, payload.content);
          assert.strictEqual(component.createdOn, testComponent.createdOn.toISOString());
          assert(component.updatedOn);

          const { project } = component;
          assert(project);
          assert.strictEqual(project.id, testProject.id);
          assert.strictEqual(project.name, testProject.name);

          const { blueprint } = component;
          assert(blueprint);
          assert.strictEqual(blueprint.id, testBlueprint.id);
          assert.strictEqual(blueprint.name, testBlueprint.name);
          assert.strictEqual(blueprint.version, testBlueprint.version);
          assert.strictEqual(blueprint.isCurrent, true);

          const { createdBy } = component;
          assert(createdBy);
          assert.strictEqual(createdBy.displayName, notAuthorizedUser.displayName);
          assert.strictEqual(createdBy.username, notAuthorizedUser.username);

          const { updatedBy } = component;
          assert(updatedBy);
          assert.strictEqual(updatedBy.displayName, testUser.displayName);
          assert.strictEqual(updatedBy.username, testUser.username);

          done();
        });
    });

    it('should successfully update a component that references a blueprint version', (done) => {
      apiRoute = `/projects/${testProject.id}/components/${testComponentWithBlueprintVersion.id}`;
      payload = {
        name: undefined,
        content: {
          aFieldFromThePast: 'this has been updated',
        },
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, component } = res.body;
          assert.strictEqual(message, 'component has been successfully updated');
          assert(component);
          assert.strictEqual(component.id, testComponentWithBlueprintVersion.id);
          assert.strictEqual(component.name, testComponentWithBlueprintVersion.name);
          assert.deepStrictEqual(component.content, payload.content);
          assert.strictEqual(
            component.createdOn,
            testComponentWithBlueprintVersion.createdOn.toISOString(),
          );
          assert(component.updatedOn);

          const { project } = component;
          assert(project);
          assert.strictEqual(project.id, testProject.id);
          assert.strictEqual(project.name, testProject.name);

          const { blueprint } = component;
          assert(blueprint);
          assert.strictEqual(blueprint.id, testBlueprint.id);
          assert.strictEqual(blueprint.name, testBlueprintVersion.name);
          assert.strictEqual(blueprint.version, testBlueprintVersion.version);
          assert.strictEqual(blueprint.isCurrent, false);

          const { createdBy } = component;
          assert(createdBy);
          assert.strictEqual(createdBy.displayName, testUser.displayName);
          assert.strictEqual(createdBy.username, testUser.username);

          const { updatedBy } = component;
          assert(updatedBy);
          assert.strictEqual(updatedBy.displayName, testUser.displayName);
          assert.strictEqual(updatedBy.username, testUser.username);

          done();
        });
    });
  });
});
