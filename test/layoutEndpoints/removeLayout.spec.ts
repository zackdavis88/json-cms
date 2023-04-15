/* eslint-disable quotes */
import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User, Layout, LayoutComponent } from '../../src/models';
import { componentPayload1 } from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/layouts/:layoutId';

interface RemoveLayoutPayload {
  confirm?: unknown;
}

describe('[Layout] Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let authToken: string;
    let notAuthorizedUser: User;
    let notAuthorizedToken: string;
    let testLayout: Layout;
    let deletedTestLayout: Layout;
    let payload: RemoveLayoutPayload;

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
      const testComponent = await testProject.createComponent({
        ...componentPayload1,
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
          componentId: testComponent.id,
          order: 0,
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
      payload = {
        confirm: testLayout.name,
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
      apiRoute = `/projects/wrong/layouts/${testLayout.id}`;
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
      apiRoute = `/projects/${testHelper.generateUUID()}/layouts/${testLayout.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested layout not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
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
        request(serverUrl)
          .delete(apiRoute)
          .set('x-auth-token', notAuthorizedToken)
          .send(payload)
          .expect(
            401,
            {
              error: 'you do not have permission to manage layouts',
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
      payload.confirm = true;
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

    it('should reject requests when confirm does not match the layouts name', (done) => {
      payload.confirm = 'NotTheRightName';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: `confirm input must have a value of ${testLayout.name}`,
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully remove a layout', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, layout } = res.body;
          assert.strictEqual(message, 'layout has been successfully removed');
          assert(layout);
          assert.strictEqual(layout.id, testLayout.id);
          assert.strictEqual(layout.name, testLayout.name);
          assert.strictEqual(layout.createdOn, testLayout.createdOn.toISOString());
          assert.strictEqual(layout.updatedOn, testLayout.updatedOn?.toISOString());

          const { project } = layout;
          assert(project);
          assert.strictEqual(project.id, testProject.id);
          assert.strictEqual(project.name, testProject.name);

          const { createdBy } = layout;
          assert(createdBy);
          assert.strictEqual(createdBy.displayName, notAuthorizedUser.displayName);
          assert.strictEqual(createdBy.username, notAuthorizedUser.username);

          const { updatedBy } = layout;
          assert(updatedBy);
          assert.strictEqual(updatedBy.displayName, testUser.displayName);
          assert.strictEqual(updatedBy.username, testUser.username);

          const { deletedBy } = layout;
          assert(deletedBy);
          assert.strictEqual(deletedBy.displayName, testUser.displayName);
          assert.strictEqual(deletedBy.username, testUser.username);

          // Validate that isActive is set to false in the database.
          Layout.findOne({ where: { id: testLayout.id } }).then((layoutInDatabase) => {
            if (!layoutInDatabase) {
              return done('component not found');
            }
            assert.strictEqual(
              layout.deletedOn,
              layoutInDatabase.deletedOn?.toISOString(),
            );
            assert.strictEqual(layoutInDatabase.isActive, false);
            LayoutComponent.findAll({ where: { layoutId: testLayout.id } }).then(
              (layoutComponents) => {
                assert.strictEqual(layoutComponents.length, 0);
                done();
              },
            );
          });
        });
    });
  });
});
