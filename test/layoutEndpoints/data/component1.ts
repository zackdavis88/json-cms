export const componentPayload = {
  name: 'unit-test-component-one',
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
