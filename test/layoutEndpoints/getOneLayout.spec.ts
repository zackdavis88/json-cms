/* eslint-disable quotes */
import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User, Layout, LayoutComponent, Component } from '../../src/models';
import { componentPayload1, componentPayload2, componentPayload3 } from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/layouts/:layoutId';

describe('[Layout] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let authToken: string;
    let notAuthorizedUser: User;
    let notAuthorizedToken: string;
    let testLayout: Layout;
    let deletedTestLayout: Layout;
    let testComponent1: Component;
    let testComponent2: Component;
    let testComponent3: Component;

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

      testLayout = await testProject.createLayout({
        name: 'unit-test-layout',
        createdById: notAuthorizedUser.id,
        updatedOn: new Date(),
        updatedById: testUser.id,
      });
      await LayoutComponent.bulkCreate([
        {
          layoutId: testLayout.id,
          componentId: testComponent2.id,
          order: 0,
        },
        {
          layoutId: testLayout.id,
          componentId: testComponent3.id,
          order: 1,
        },
        {
          layoutId: testLayout.id,
          componentId: testComponent1.id,
          order: 2,
        },
      ]);

      deletedTestLayout = await testProject.createLayout({
        name: 'this-is-deleted',
        createdById: testUser.id,
        isActive: false,
      });
      authToken = testHelper.generateToken(testUser);
      notAuthorizedToken = testHelper.generateToken(notAuthorizedUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/layouts/${testLayout.id}`;
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
      apiRoute = '/projects/wrong/layouts';
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
      apiRoute = `/projects/${testHelper.generateUUID()}/layouts`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests that have an invalid layout id', (done) => {
      apiRoute = `/projects/${testProject.id}/layouts/badId`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'requested layout id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the layout is not found', (done) => {
      apiRoute = `/projects/${testProject.id}/layouts/${testHelper.generateUUID()}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested layout not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the layout has been deleted', (done) => {
      apiRoute = `/projects/${testProject.id}/layouts/${deletedTestLayout.id}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested layout not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).get(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
        401,
        {
          error: 'you do not have permission to read layouts',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should successfully return a layout', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, layout } = res.body;
          assert.strictEqual(message, 'layout has been successfully retrieved');
          assert.strictEqual(layout.id, testLayout.id);
          assert.strictEqual(layout.name, testLayout.name);

          assert.strictEqual(layout.createdOn, testLayout.createdOn.toISOString());
          const { createdBy } = layout;
          assert(createdBy);
          assert.strictEqual(createdBy.username, notAuthorizedUser.username);
          assert.strictEqual(createdBy.displayName, notAuthorizedUser.displayName);

          assert.strictEqual(layout.updatedOn, testLayout.updatedOn?.toISOString());
          const { updatedBy } = layout;
          assert(updatedBy);
          assert.strictEqual(updatedBy.username, testUser.username);
          assert.strictEqual(updatedBy.displayName, testUser.displayName);

          assert.deepStrictEqual(layout.componentOrder, [
            testComponent2.id,
            testComponent3.id,
            testComponent1.id,
          ]);

          assert.deepStrictEqual(layout.components, {
            [testComponent2.id]: {
              id: testComponent2.id,
              name: testComponent2.name,
              content: testComponent2.content,
            },
            [testComponent3.id]: {
              id: testComponent3.id,
              name: testComponent3.name,
              content: testComponent3.content,
            },
            [testComponent1.id]: {
              id: testComponent1.id,
              name: testComponent1.name,
              content: testComponent1.content,
            },
          });
          done();
        });
    });
  });
});
