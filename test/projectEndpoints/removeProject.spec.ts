import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId';

interface RemovePayload {
  confirm?: unknown;
}

describe('[Project] Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let authToken: string;
    let notAuthorizedToken: string;
    let testUser: User;
    let notAuthorizedUser: User;
    let testProject: Project;
    let payload: RemovePayload;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      notAuthorizedUser = await testHelper.createTestUser();
      testProject = await testHelper.createTestProject(testUser);
      authToken = testHelper.generateToken(testUser);
      notAuthorizedToken = testHelper.generateToken(notAuthorizedUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}`;
      payload = {
        confirm: testProject.name,
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
      apiRoute = '/projects/wrong';
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
      apiRoute = `/projects/${testHelper.generateUUID()}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
        401,
        {
          error: 'you do not have permission to update this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests from users that do not have isProjectAdmin permissions', (done) => {
      testProject.createMembership({ userId: notAuthorizedUser.id }).then(() => {
        request(serverUrl)
          .delete(apiRoute)
          .set('x-auth-token', notAuthorizedToken)
          .expect(
            401,
            {
              error: 'you do not have permission to update this project',
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

    it('should reject requests when confirm does not match the projects name', (done) => {
      payload.confirm = 'NotTheName';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: `confirm input must have a value of ${testProject.name}`,
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully remove a project', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, project } = res.body;
          assert.strictEqual(message, 'project has been successfully removed');
          assert(project);
          assert.strictEqual(project.id, testProject.id);
          assert.strictEqual(project.name, testProject.name);
          assert.strictEqual(project.description, testProject.description);
          assert.strictEqual(project.createdOn, testProject.createdOn.toISOString());
          assert(project.createdBy);
          assert.strictEqual(project.createdBy.displayName, testUser.displayName);
          assert.strictEqual(project.createdBy.username, testUser.username);

          assert(project.deletedBy);
          assert.strictEqual(project.deletedBy.displayName, testUser.displayName);
          assert.strictEqual(project.deletedBy.username, testUser.username);
          // Validate that isActive is set to false in the database.
          Project.findOne({ where: { id: testProject.id } }).then((projectInDatabase) => {
            if (!projectInDatabase) {
              return done('project not found');
            }
            assert.strictEqual(
              project.deletedOn,
              projectInDatabase.deletedOn?.toISOString(),
            );
            assert.strictEqual(projectInDatabase.deletedById, testUser.id);
            assert.strictEqual(projectInDatabase.isActive, false);
            done();
          });
        });
    });
  });
});
