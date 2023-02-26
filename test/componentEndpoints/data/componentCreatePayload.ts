export const componentCreatePayload = {
  name: 'unit-test-component-create',
  content: {
    heroPanel: {
      headingText: {
        desktop: 'desktop content, this may be very long',
        tablet: 'tablet content, could be different from desktop',
        mobile: 'mobile content, this could be very brief for smaller screens',
      },
      styles: {
        desktopStyles: [
          {
            property: 'backgroundColor',
            value: 'blue',
          },
          {
            property: 'color',
            value: 'white',
          },
          {
            property: 'fontSize',
            value: '48px',
          },
        ],
        tabletStyles: [
          {
            property: 'backgroundColor',
            value: 'orange',
          },
          {
            property: 'color',
            value: 'white',
          },
          {
            property: 'fontSize',
            value: '24px',
          },
        ],
        mobileStyles: [
          {
            property: 'backgroundColor',
            value: 'green',
          },
          {
            property: 'color',
            value: 'white',
          },
          {
            property: 'fontSize',
            value: '12px',
          },
        ],
      },
      timer: {
        startTime: '2023-02-25T20:46:09.115Z',
        endTime: '2023-05-25T05:00:00.115Z',
        hideTimer: false,
      },
      totalSold: 57,
    },
  },
};

export const componentBlueprintPayload = {
  name: 'unit-test-blueprint-for-component-create',
  fields: [
    {
      name: 'heroPanel',
      type: 'OBJECT',
      fields: [
        {
          name: 'headingText',
          type: 'OBJECT',
          isRequired: true,
          fields: [
            {
              name: 'desktop',
              type: 'STRING',
              regex: '^desktop',
            },
            {
              name: 'tablet',
              type: 'STRING',
              min: 5,
              max: 50,
            },
            {
              name: 'mobile',
              type: 'STRING',
            },
          ],
        },
        {
          name: 'styles',
          type: 'OBJECT',
          fields: [
            {
              name: 'desktopStyles',
              type: 'ARRAY',
              arrayOf: {
                name: 'cssKeyValuePair',
                type: 'OBJECT',
                fields: [
                  {
                    name: 'property',
                    type: 'STRING',
                  },
                  {
                    name: 'value',
                    type: 'STRING',
                  },
                ],
              },
            },
            {
              name: 'tabletStyles',
              type: 'ARRAY',
              arrayOf: {
                name: 'cssKeyValuePair',
                type: 'OBJECT',
                fields: [
                  {
                    name: 'property',
                    type: 'STRING',
                  },
                  {
                    name: 'value',
                    type: 'STRING',
                  },
                ],
              },
            },
            {
              name: 'mobileStyles',
              type: 'ARRAY',
              arrayOf: {
                name: 'cssKeyValuePair',
                type: 'OBJECT',
                fields: [
                  {
                    name: 'property',
                    type: 'STRING',
                  },
                  {
                    name: 'value',
                    type: 'STRING',
                  },
                ],
              },
            },
          ],
        },
        {
          name: 'timer',
          type: 'OBJECT',
          fields: [
            {
              name: 'startTime',
              type: 'DATE',
            },
            {
              name: 'endTime',
              type: 'DATE',
            },
            {
              name: 'hideTimer',
              type: 'BOOLEAN',
            },
          ],
        },
        {
          name: 'totalSold',
          type: 'NUMBER',
          isInteger: true,
          max: 100000,
          min: 10,
        },
        {
          name: 'stringArray',
          type: 'ARRAY',
          min: 1,
          max: 5,
          arrayOf: {
            name: 'stringItems',
            type: 'STRING',
            min: 3,
            max: 10,
            regex: '^a_',
          },
        },
        {
          name: 'booleanArray',
          type: 'ARRAY',
          arrayOf: {
            name: 'booleanItems',
            type: 'BOOLEAN',
          },
        },
        {
          name: 'integerArray',
          type: 'ARRAY',
          arrayOf: {
            name: 'integerItems',
            type: 'NUMBER',
            isInteger: true,
          },
        },
      ],
    },
    {
      name: 'numberArray',
      type: 'ARRAY',
      arrayOf: {
        name: 'numberItems',
        type: 'NUMBER',
        min: 0.6,
        max: 60.59,
      },
    },
    {
      name: 'dateArray',
      type: 'ARRAY',
      arrayOf: {
        name: 'dateItems',
        type: 'DATE',
      },
    },
  ],
};
