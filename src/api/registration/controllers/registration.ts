/**
 * registration controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::registration.registration', ({ strapi }) => ({
  async create(ctx) {
    const { data, files } = ctx.request.body;

    try {
      // Parse the data if it's a string (from FormData)
      const registrationData = typeof data === 'string' ? JSON.parse(data) : data;

      // Create the registration entry
      const entry = await strapi.entityService.create('api::registration.registration', {
        data: registrationData,
      });

      // If there's a payment receipt file, upload and link it
      if (files && files.payment_receipt) {
        const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
          data: {
            refId: entry.id,
            ref: 'api::registration.registration',
            field: 'payment_receipt',
          },
          files: files.payment_receipt,
        });
      }

      // Fetch the created entry with all relations
      const result = await strapi.entityService.findOne('api::registration.registration', entry.id, {
        populate: ['payment_receipt', 'event'],
      });

      return { data: result };
    } catch (error) {
      console.error('Registration error:', error);
      ctx.throw(400, error.message);
    }
  },
}));
