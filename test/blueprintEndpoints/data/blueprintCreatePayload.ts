// Building a big blueprint with several levels of nesting.
export const blueprintCreatePayload = {
  name: 'unit-test-blueprint-create',
  fields: [
    {
      type: 'STRING',
      name: 'stringField',
    },
    {
      type: 'ARRAY',
      name: 'arrayField',
      arrayOf: {
        type: 'OBJECT',
        name: 'arrayField_objectField',
        fields: [
          {
            type: 'STRING',
            name: 'arrayField_objectField_stringField',
          },
          {
            type: 'NUMBER',
            name: 'arrayField_objectField_numberField',
          },
        ],
      },
    },
    {
      type: 'OBJECT',
      name: 'objectField',
      fields: [
        {
          type: 'BOOLEAN',
          name: 'objectField_booleanField',
        },
        {
          type: 'DATE',
          name: 'objectField_dateField',
        },
        {
          type: 'OBJECT',
          name: 'objectField_objectField',
          fields: [
            {
              type: 'STRING',
              name: 'objectField_objectField_stringField',
            },
            {
              type: 'DATE',
              name: 'objectField_objectField_dateField',
            },
            {
              type: 'BOOLEAN',
              name: 'objectField_objectField_booleanField1',
            },
            {
              type: 'NUMBER',
              name: 'objectField_objectField_numberField',
            },
            {
              type: 'ARRAY',
              name: 'objectField_objectField_arrayField',
              arrayOf: {
                type: 'OBJECT',
                name: 'objectField_objectField_arrayField_objectField',
                fields: [
                  {
                    type: 'ARRAY',
                    name: 'objectField_objectField_arrayField_objectField_arrayField',
                    arrayOf: {
                      type: 'OBJECT',
                      name: 'objectField_objectField_arrayField_objectField_arrayField_objectField',
                      fields: [
                        {
                          type: 'STRING',
                          name: 'objectField_objectField_arrayField_objectField_arrayField_objectField_stringField',
                        },
                        {
                          type: 'NUMBER',
                          name: 'objectField_objectField_arrayField_objectField_arrayField_objectField_numberField',
                        },
                        {
                          type: 'BOOLEAN',
                          name: 'objectField_objectField_arrayField_objectField_arrayField_objectField_booleanField',
                        },
                        {
                          type: 'DATE',
                          name: 'objectField_objectField_arrayField_objectField_arrayField_objectField_dateField',
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              type: 'BOOLEAN',
              name: 'objectField_objectField_booleanField2',
            },
          ],
        },
      ],
    },
    {
      type: 'BOOLEAN',
      name: 'booleanField',
    },
  ],
};
