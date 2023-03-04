/* eslint-disable quotes */
import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User, Component } from '../../src/models';
import { componentPayload1, componentPayload2, componentPayload3 } from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/layouts';

interface CreateLayoutPayload {
  name?: unknown;
  componentOrder?: unknown;
}

describe('[Layout] Create', () => {
  describe(`POST ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let authToken: string;
    let notAuthorizedUser: User;
    let notAuthorizedToken: string;
    let testComponent1: Component;
    let testComponent2: Component;
    let testComponent3: Component;
    let deletedTestComponent: Component;
    let payload: CreateLayoutPayload;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      notAuthorizedUser = await testHelper.createTestUser();
      testProject = await testHelper.createTestProject(testUser);
      const testBlueprint = await testProject.createBlueprint({
        fields: [],
        name: testHelper.generateUUID(),
        version: 2,
        createdById: testUser.id,
        updatedOn: new Date(),
        updatedById: testUser.id,
      });
      testComponent1 = await testProject.createComponent({
        ...componentPayload1,
        blueprintId: testBlueprint.id,
        createdById: testUser.id,
      });
      testComponent2 = await testProject.createComponent({
        ...componentPayload2,
        blueprintId: testBlueprint.id,
        createdById: testUser.id,
      });
      testComponent3 = await testProject.createComponent({
        ...componentPayload3,
        blueprintId: testBlueprint.id,
        createdById: testUser.id,
      });
      deletedTestComponent = await testProject.createComponent({
        content: {},
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
      apiRoute = `/projects/${testProject.id}/layouts`;
      payload = {
        name: 'unit-test-layout-create',
        componentOrder: [
          testComponent2.id,
          testComponent1.id,
          testComponent3.id,
          testComponent1.id,
        ],
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
      apiRoute = '/projects/wrong/layouts';
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
      apiRoute = `/projects/${testHelper.generateUUID()}/layouts`;
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
          error: 'you do not have permission to manage layouts',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests from users that do not have isLayoutManager permissions', (done) => {
      testProject.createMembership({ userId: notAuthorizedUser.id }).then(() => {
        request(serverUrl).post(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
          401,
          {
            error: 'you do not have permission to manage layouts',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
      });
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

    it('should reject requests when componentOrder is not an array', (done) => {
      payload.componentOrder = 'this is not an array';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'componentOrder must be an array of component ids',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when componentOrder contains an item that is not a string', (done) => {
      payload.componentOrder = [{ something: 'wrong' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'componentOrder contains a componentId that is not a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when componentOrder contains an item that is not a valid uuid', (done) => {
      payload.componentOrder = [
        testComponent1.id,
        testComponent1.id,
        'this will fail validation',
      ];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'componentOrder contains a componentId that is not valid',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when componentOrder contains an item that is not found', (done) => {
      payload.componentOrder = [
        testComponent1.id,
        testComponent1.id,
        deletedTestComponent.id,
      ];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'componentOrder contains a component that was not found',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully create a new layout', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, layout } = res.body;
          assert.strictEqual(message, 'layout has been successfully created');
          assert(layout);
          assert(layout.id);
          assert.strictEqual(layout.name, payload.name);
          assert.deepStrictEqual(layout.componentOrder, payload.componentOrder);
          assert(layout.components);
          assert(layout.createdOn);
          assert(layout.createdBy);
          assert.strictEqual(layout.createdBy.displayName, testUser.displayName);
          assert.strictEqual(layout.createdBy.username, testUser.username);

          const firstComponent = layout.components[layout.componentOrder[0]];
          assert.strictEqual(firstComponent.id, testComponent2.id);
          assert.strictEqual(firstComponent.name, testComponent2.name);
          assert.deepStrictEqual(firstComponent.content, testComponent2.content);

          const secondComponent = layout.components[layout.componentOrder[1]];
          assert.strictEqual(secondComponent.id, testComponent1.id);
          assert.strictEqual(secondComponent.name, testComponent1.name);
          assert.deepStrictEqual(secondComponent.content, testComponent1.content);

          const thirdComponent = layout.components[layout.componentOrder[2]];
          assert.strictEqual(thirdComponent.id, testComponent3.id);
          assert.strictEqual(thirdComponent.name, testComponent3.name);
          assert.deepStrictEqual(thirdComponent.content, testComponent3.content);

          const fourthComponent = layout.components[layout.componentOrder[3]];
          assert.strictEqual(fourthComponent.id, testComponent1.id);
          assert.strictEqual(fourthComponent.name, testComponent1.name);
          assert.deepStrictEqual(fourthComponent.content, testComponent1.content);

          done();
        });
    });
  });
});
