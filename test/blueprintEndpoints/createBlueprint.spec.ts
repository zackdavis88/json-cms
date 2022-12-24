import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Project, User, BlueprintField } from '../../src/models';
import { blueprintCreatePayload } from './data';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/blueprints';

interface CreatePayload {
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

describe('[Blueprint] Create', () => {
  describe(`POST ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let notAuthorizedUser: User;
    let authToken: string;
    let notAuthorizedToken: string;
    let payload: CreatePayload;

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
      apiRoute = `/projects/${testProject.id}/blueprints`;
      payload = {
        ...blueprintCreatePayload,
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
      apiRoute = '/projects/wrong/blueprints';
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
      apiRoute = `/projects/${testHelper.generateUUID()}/blueprints`;
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

    it('should reject requests when fields is missing', (done) => {
      payload.fields = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'fields is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when fields is not an array', (done) => {
      payload.fields = '';
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
      payload.fields = ['something'];
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
      payload.fields = [{}];
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
      payload.fields = [{ type: { something: 'wrong' } }];
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
          type: 'ARRAY',
          name: 'testArray',
          arrayOf: { type: 'NUMBER', name: 'abc-_+=&^%$#@!/|{}()?.,<>;\':"*]' },
        },
      ];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'testArray field object name contains invalid characters',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when a field-object isRequired is not a boolean', (done) => {
      payload.fields = [{ type: 'DATE', name: 'testDate', isRequired: 'no' }];
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
      payload.fields = [{ type: 'NUMBER', name: 'testNumber', isInteger: 'yes' }];
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
      payload.fields = [{ type: 'ARRAY', name: 'testArray', arrayOf: '' }];
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

    it('should reject requests when an field-object OBJECT type contains an empty fields array', (done) => {
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

    it('should successfully create a new blueprint', (done) => {
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
          assert.strictEqual(message, 'blueprint has been successfully created');
          assert(blueprint);
          assert(blueprint.id);
          testHelper.addTestBlueprintId(blueprint.id);
          assert.strictEqual(blueprint.name, payload.name);
          assert(blueprint.createdOn);
          assert(blueprint.createdBy);
          assert.strictEqual(blueprint.createdBy.username, testUser.username);
          assert.strictEqual(blueprint.createdBy.displayName, testUser.displayName);

          assert.deepStrictEqual(removeFieldIds(blueprint.fields), payload.fields);

          assert.strictEqual(blueprint.version, 1);
          done();
        });
    });
  });
});
