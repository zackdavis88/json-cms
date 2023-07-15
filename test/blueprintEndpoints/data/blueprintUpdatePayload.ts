export const blueprintUpdatePayload = {
  name: 'unit-test-blueprint-update',
  fields: [
    {
      name: 'container',
      type: 'OBJECT',
      fields: [
        {
          name: 'content',
          type: 'OBJECT',
          fields: [
            {
              name: 'desktopContent',
              type: 'STRING',
            },
            {
              name: 'tabletContent',
              type: 'STRING',
            },
            {
              name: 'mobileContent',
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
                name: 'desktopCSSKeyValuePair',
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
                name: 'tabletCSSKeyValuePair',
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
                name: 'mobileCSSKeyValuePair',
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
      ],
    },
  ],
};
