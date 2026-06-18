/**
 * registration controller
 */

import { factories } from '@strapi/strapi'
import { generateRegistrationsPDF } from '../services/pdf-export'

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

  async export(ctx) {
    try {
      const { format = 'csv' } = ctx.query;

      // Fetch all registrations with event details
      const registrations = await strapi.entityService.findMany('api::registration.registration', {
        populate: ['event', 'payment_receipt'],
      });

      if (format === 'csv') {
        return this.exportAsCSV(ctx, registrations);
      } else if (format === 'json') {
        return this.exportAsJSON(ctx, registrations);
      } else if (format === 'pdf') {
        return this.exportAsPDF(ctx, registrations);
      } else {
        ctx.throw(400, 'Invalid format. Use ?format=csv, ?format=json, or ?format=pdf');
      }
    } catch (error) {
      console.error('Export error:', error);
      ctx.throw(500, error.message);
    }
  },

  async exportByEvent(ctx) {
    try {
      const { eventId } = ctx.params;
      const { format = 'csv' } = ctx.query;

      // Fetch registrations for specific event
      const registrations = await strapi.entityService.findMany('api::registration.registration', {
        filters: { event: { id: eventId } },
        populate: ['event', 'payment_receipt'],
      });

      const eventName = registrations[0]?.event?.title || 'Event';

      if (format === 'csv') {
        return this.exportAsCSV(ctx, registrations);
      } else if (format === 'json') {
        return this.exportAsJSON(ctx, registrations);
      } else if (format === 'pdf') {
        return this.exportAsPDF(ctx, registrations, eventName);
      } else {
        ctx.throw(400, 'Invalid format. Use ?format=csv, ?format=json, or ?format=pdf');
      }
    } catch (error) {
      console.error('Export error:', error);
      ctx.throw(500, error.message);
    }
  },

  exportAsCSV(ctx, registrations) {
    // Create CSV header
    const header = 'First Name,Last Name,Email,Phone,Gender,Event,Payment Status,Expectation,Payment Receipt\n';

    // Create CSV rows
    const rows = registrations.map(reg => {
      return [
        reg.first_name || '',
        reg.last_name || '',
        reg.email || '',
        reg.phone || '',
        reg.gender || '',
        reg.event?.title || '',
        reg.payment_status || '',
        (reg.expectation || '').replace(/,/g, ';').replace(/\n/g, ' '),
        reg.payment_receipt?.url || ''
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csv = header + rows;

    // Set headers for file download
    ctx.set('Content-Type', 'text/csv');
    ctx.set('Content-Disposition', `attachment; filename="registrations-${new Date().toISOString().split('T')[0]}.csv"`);

    return csv;
  },

  exportAsJSON(ctx, registrations) {
    const data = registrations.map(reg => ({
      firstName: reg.first_name,
      lastName: reg.last_name,
      email: reg.email,
      phone: reg.phone,
      gender: reg.gender,
      event: reg.event?.title || '',
      paymentStatus: reg.payment_status,
      expectation: reg.expectation,
      paymentReceipt: reg.payment_receipt?.url || ''
    }));

    ctx.set('Content-Type', 'application/json');
    ctx.set('Content-Disposition', `attachment; filename="registrations-${new Date().toISOString().split('T')[0]}.json"`);

    return { data };
  },

  exportAsPDF(ctx, registrations, eventName?) {
    const doc = generateRegistrationsPDF(registrations, eventName);

    ctx.set('Content-Type', 'application/pdf');
    ctx.set('Content-Disposition', `attachment; filename="registrations-${new Date().toISOString().split('T')[0]}.pdf"`);

    ctx.body = doc;
  },
}));
