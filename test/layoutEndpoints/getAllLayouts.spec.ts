/* eslint-disable quotes */
import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User, Layout, LayoutComponent } from '../../src/models';
import { componentPayload1, componentPayload2, componentPayload3 } from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/layouts';

describe('[Layout] Get All', () => {
  describe(`GET ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let authToken: string;
    let notAuthorizedUser: User;
    let notAuthorizedToken: string;
    let testLayout: Layout;

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
      const testComponent1 = await testProject.createComponent({
        ...componentPayload1,
        blueprintId: testBlueprint.id,
        createdById: testUser.id,
      });
      const testComponent2 = await testProject.createComponent({
        ...componentPayload2,
        blueprintId: testBlueprint.id,
        createdById: testUser.id,
      });
      const testComponent3 = await testProject.createComponent({
        ...componentPayload3,
        blueprintId: testBlueprint.id,
        createdById: testUser.id,
      });
      await testProject.createLayout({
        name: 'unit-test-layout-1',
        createdById: notAuthorizedUser.id,
      });
      await testProject.createLayout({
        name: 'unit-test-layout-2',
        createdById: notAuthorizedUser.id,
      });
      await testProject.createLayout({
        name: 'unit-test-layout-3',
        createdById: notAuthorizedUser.id,
      });
      await testProject.createLayout({
        name: 'unit-test-layout-4',
        createdById: notAuthorizedUser.id,
      });
      await testProject.createLayout({
        name: 'unit-test-layout-5',
        createdById: notAuthorizedUser.id,
      });
      await testProject.createLayout({
        name: 'unit-test-layout-6',
        createdById: notAuthorizedUser.id,
      });

      testLayout = await testProject.createLayout({
        name: 'unit-test-layout-7',
        createdById: notAuthorizedUser.id,
        updatedOn: new Date(),
        updatedById: testUser.id,
      });
      await LayoutComponent.bulkCreate([
        {
          layoutId: testLayout.id,
          componentId: testComponent1.id,
          order: 0,
        },
        {
          layoutId: testLayout.id,
          componentId: testComponent3.id,
          order: 1,
        },
        {
          layoutId: testLayout.id,
          componentId: testComponent2.id,
          order: 2,
        },
      ]);

      await testProject.createLayout({
        name: 'unit-test-layout-8',
        createdById: notAuthorizedUser.id,
      });
      await testProject.createLayout({
        name: 'unit-test-layout-9',
        isActive: false,
        createdBy: testUser.id,
      });
      authToken = testHelper.generateToken(testUser);
      notAuthorizedToken = testHelper.generateToken(notAuthorizedUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/layouts`;
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

    it('should successfully return a list of layouts', (done) => {
      apiRoute = `${apiRoute}?itemsPerPage=5&page=2`;
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
            project,
            layouts,
            page,
            itemsPerPage,
            totalPages,
            totalItems,
          } = res.body;
          assert.strictEqual(message, 'layout list has been successfully retrieved');
          assert.strictEqual(page, 2);
          assert.strictEqual(itemsPerPage, 5);
          assert.strictEqual(totalItems, 8);
          assert.strictEqual(totalPages, 2);
          assert(project);
          assert.strictEqual(project.id, testProject.id);
          assert.strictEqual(project.name, testProject.name);

          assert(layouts);
          assert.strictEqual(layouts.length, 3);

          const layout = layouts[1];
          assert.strictEqual(layout.id, testLayout.id);
          assert.strictEqual(layout.name, testLayout.name);
          assert.strictEqual(layout.totalComponents, 3);
          assert.strictEqual(layout.createdOn, testLayout.createdOn.toISOString());
          assert.strictEqual(layout.updatedOn, testLayout.updatedOn?.toISOString());

          const { createdBy } = layout;
          assert(createdBy);
          assert.strictEqual(createdBy.displayName, notAuthorizedUser.displayName);
          assert.strictEqual(createdBy.username, notAuthorizedUser.username);

          const { updatedBy } = layout;
          assert(updatedBy);
          assert.strictEqual(updatedBy.displayName, testUser.displayName);
          assert.strictEqual(updatedBy.username, testUser.username);
          done();
        });
    });
  });
});
