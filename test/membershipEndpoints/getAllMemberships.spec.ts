import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Membership, Project, User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/memberships';

describe('[Membership] Get All', () => {
  describe(`GET ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let memberUser: User;
    let testMembership: Membership;
    let authToken: string;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser();
      const testUser2 = await testHelper.createTestUser();
      const testUser3 = await testHelper.createTestUser();
      memberUser = await testHelper.createTestUser();
      const testUser5 = await testHelper.createTestUser();
      testProject = await testHelper.createTestProject(testUser);
      await testProject.createMembership({ userId: testUser2.id });
      await testProject.createMembership({ userId: testUser3.id });
      testMembership = await testProject.createMembership({
        userId: memberUser.id,
        isFragmentManager: true,
      });
      await testProject.createMembership({ userId: testUser5.id });
      authToken = testHelper.generateToken(testUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/memberships`;
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
      apiRoute = '/projects/wrong/memberships';
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
      apiRoute = `/projects/${testHelper.generateUUID()}/memberships`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should successfully return a list of memberships', (done) => {
      apiRoute = `${apiRoute}?itemsPerPage=2&page=2`;
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
            memberships,
            page,
            itemsPerPage,
            totalPages,
            totalItems,
          } = res.body;
          assert.strictEqual(message, 'membership list has been successfully retrieved');
          assert.strictEqual(page, 2);
          assert.strictEqual(itemsPerPage, 2);
          assert.strictEqual(totalPages, 3);
          assert.strictEqual(totalItems, 5);
          assert(project);
          assert.strictEqual(project.id, testProject.id);
          assert.strictEqual(project.name, testProject.name);
          assert(memberships);
          assert.strictEqual(memberships.length, 2);
          const membership = memberships[1];
          assert.strictEqual(membership.id, testMembership.id);
          assert.strictEqual(
            membership.createdOn,
            testMembership.createdOn.toISOString(),
          );
          assert(membership.user);
          assert.strictEqual(membership.user.username, memberUser.username);
          assert.strictEqual(membership.isProjectAdmin, false);
          assert.strictEqual(membership.isBlueprintManager, false);
          assert.strictEqual(membership.isLayoutManager, false);
          assert.strictEqual(membership.isFragmentManager, true);
          done();
        });
    });
  });
});
