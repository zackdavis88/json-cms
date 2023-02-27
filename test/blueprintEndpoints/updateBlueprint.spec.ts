import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import {
  Project,
  User,
  Blueprint,
  BlueprintField,
  BlueprintVersion,
  Component,
} from '../../src/models';
import { blueprintCreatePayload, blueprintUpdatePayload } from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/blueprints/:blueprintId';

interface UpdatePayload {
  name?: unknown;
  fields?: unknown;
}

type RemoveFieldIds = (fields: BlueprintField[]) => BlueprintField[];
export const removeFieldIds: RemoveFieldIds = (fields) => {
  return fields.map((field) => {
    delete field.id;
    if (field.type === 'ARRAY' && field.arrayOf) {
      return { ...field, arrayOf: removeFieldIds([field.arrayOf])[0] };
    } else if (field.type === 'OBJECT' && field.fields) {
      return { ...field, fields: removeFieldIds(field.fields) };
    }
    return { ...field };
  });
};

describe('[Blueprint] Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let testBlueprint: Blueprint;
    let testComponent: Component;
    let authToken: string;
    let notAuthorizedUser: User;
    let notAuthorizedToken: string;
    let payload: UpdatePayload;

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
      testComponent = await testProject.createComponent({
        name: testHelper.generateUUID(),
        content: {},
        blueprintId: testBlueprint.id,
        blueprintIsCurrent: true,
        createdOn: new Date(),
        createdById: testUser.id,
      });
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/blueprints/${testBlueprint.id}`;
      payload = {
        ...blueprintUpdatePayload,
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
      apiRoute = `/projects/wrong/blueprints/${testBlueprint.id}`;
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
      apiRoute = `/projects/${testHelper.generateUUID()}/blueprints/${testBlueprint.id}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested blueprint not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
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
        request(serverUrl).post(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
          401,
          {
            error: 'you do not have permission to manage blueprints',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
      });
    });

    it('should reject requests that contain no update data', (done) => {
      payload = {};
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
      payload.name = 2384902839;
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

    it('should reject requests when fields is not an array', (done) => {
      payload.fields = { something: 'that is not an array' };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'fields must be an array of field objects',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when fields is an empty array', (done) => {
      payload.fields = [];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'fields must contain at least 1 field object',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object is not an object', (done) => {
      payload.fields = [[], []];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint fields contains a value that is not an object',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object type is missing', (done) => {
      payload.fields = [{ name: 'something without a type' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object type is missing',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object type is not a string', (done) => {
      payload.fields = [{ type: true }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object type must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object type is not a valid type', (done) => {
      payload.fields = [{ type: 'WRONG' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object type is invalid',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object name is missing', (done) => {
      payload.fields = [{ type: 'NUMBER' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object name is missing',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object name is not a string', (done) => {
      payload.fields = [{ type: 'NUMBER', name: false }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object name must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object name is less than 1 character', (done) => {
      payload.fields = [{ type: 'STRING', name: '' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object name must be 1 - 100 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object name is more than 100 characters', (done) => {
      payload.fields = [{ type: 'DATE', name: Array(101).fill('b').join('') }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object name must be 1 - 100 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when field-object name contains invalid characters', (done) => {
      payload.fields = [
        {
          type: 'OBJECT',
          name: 'testObject',
          fields: [{ type: 'NUMBER', name: 'abc-_+=&^%$#@!/|{}()?.,<>;\':"*]' }],
        },
      ];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'testObject field object name contains invalid characters',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object isRequired is not a boolean', (done) => {
      payload.fields = [{ type: 'DATE', name: 'testDate', isRequired: ['yes'] }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object isRequired must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object isInteger is not a boolean', (done) => {
      payload.fields = [{ type: 'NUMBER', name: 'testNumber', isInteger: 'nope' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object isInteger must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object regex is not a string', (done) => {
      payload.fields = [{ type: 'STRING', name: 'testString', regex: false }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object regex must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object min is not a number', (done) => {
      payload.fields = [{ type: 'NUMBER', name: 'testNumber', min: false }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object min must be a number',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object max is not a number', (done) => {
      payload.fields = [{ type: 'NUMBER', name: 'testNumber', max: '5' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object max must be a number',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object array-type does not contain arrayOf', (done) => {
      payload.fields = [{ type: 'ARRAY', name: 'testArray' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object contains an ARRAY type without arrayOf',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when arrayOf is not a field-object', (done) => {
      payload.fields = [{ type: 'ARRAY', name: 'testArray', arrayOf: ['wrong'] }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object arrayOf must be a field object',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when arrayOf contains an array-type field-object', (done) => {
      payload.fields = [{ type: 'ARRAY', name: 'testArray', arrayOf: { type: 'ARRAY' } }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object arrayOf can not contain an ARRAY type',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when an field-object object-type does not contain fields', (done) => {
      payload.fields = [{ type: 'OBJECT', name: 'testObject' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object contains an OBJECT type without fields',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when an field-object object-type contains an empty fields array', (done) => {
      payload.fields = [{ type: 'OBJECT', name: 'testObject', fields: [] }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error:
              'blueprint field object contains an OBJECT type with an empty fields array',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when an field-object OBJECT-type fields is not an array', (done) => {
      payload.fields = [
        {
          type: 'OBJECT',
          name: 'testObject',
          fields: [{ type: 'OBJECT', name: 'testObjectNested', fields: 'wrong' }],
        },
      ];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'testObject field object fields must be an array of field objects',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when fields contains field-objects with duplicate names', (done) => {
      const duplicateName = 'testObject';
      payload.fields = [
        {
          type: 'OBJECT',
          name: duplicateName,
          fields: [{ type: 'STRING', name: 'testStringNested', fields: [] }],
        },
        {
          type: 'OBJECT',
          name: duplicateName,
          fields: [{ type: 'STRING', name: 'testStringNested', fields: [] }],
        },
      ];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: `blueprint fields contains duplicate name value: ${duplicateName}`,
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully update a blueprint', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, blueprint } = res.body;
          assert.strictEqual(message, 'blueprint has been successfully updated');
          assert(blueprint);
          assert.strictEqual(blueprint.id, testBlueprint.id);
          assert.strictEqual(blueprint.name, payload.name);
          assert.strictEqual(blueprint.version, testBlueprint.version + 1);

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

          assert.deepStrictEqual(removeFieldIds(blueprint.fields), payload.fields);

          // Check that a new BlueprintVersion was created to retain the old data.
          BlueprintVersion.findOne({
            where: {
              blueprintId: testBlueprint.id,
              version: testBlueprint.version,
            },
          }).then((blueprintVersion) => {
            if (!blueprintVersion) {
              return done('blueprint version not found');
            }

            assert.strictEqual(blueprintVersion.name, testBlueprint.name);
            assert.deepStrictEqual(
              removeFieldIds(blueprintVersion.fields),
              testBlueprint.fields,
            );

            // Check that existing components had their blueprintVersion updated.
            Component.findOne({
              where: { id: testComponent.id },
              include: { model: BlueprintVersion, as: 'blueprintVersion' },
            }).then((component) => {
              if (!component) {
                return done('test component not found');
              }

              assert.strictEqual(component.blueprintIsCurrent, false);
              assert(component.blueprintVersion);
              assert.strictEqual(component.blueprintVersion.id, blueprintVersion.id);
              assert.strictEqual(component.blueprintVersion.name, blueprintVersion.name);
              assert.strictEqual(
                component.blueprintVersion.version,
                blueprintVersion.version,
              );
              done();
            });
          });
        });
    });
  });
});
