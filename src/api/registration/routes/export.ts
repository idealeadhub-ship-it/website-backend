export default {
  routes: [
    {
      method: 'GET',
      path: '/registrations/export',
      handler: 'registration.export',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/registrations/export/:eventId',
      handler: 'registration.exportByEvent',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
