export const componentUpdatePayload = {
  name: 'unit-test-component-update',
  content: {
    heroPanel: {
      headingText: {
        desktop: 'desktop updated',
        tablet: 'tablet updated',
        mobile: 'mobile updated',
      },
      styles: {
        desktopStyles: [
          {
            property: 'border',
            value: '1px solid black',
          },
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
        startTime: '2023-02-28T23:12:14.410Z',
        endTime: '2023-02-28T02:45:00.410Z',
        hideTimer: true,
      },
      totalSold: 100,
    },
  },
};
