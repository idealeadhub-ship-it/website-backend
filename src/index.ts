// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }) {
    try {
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (!publicRole) {
        console.log('[Bootstrap] Public role not found, skipping permission setup');
        return;
      }

      // Use numeric id for role relations, not documentId
      const roleId = publicRole.id; // numeric id for SQLite foreign key
      console.log('[Bootstrap] Found public role:', publicRole.documentId, '(numeric id:', roleId, ')');

      const newPermissions = [
        'api::hero-image.hero-image.find',
        'api::hero-image.hero-image.findOne',
        'api::site-content.site-content.find',
        'api::site-content.site-content.findOne',
        'api::event.event.find',
        'api::event.event.findOne',
        'api::registration.registration.create',
        'api::gallery.gallery.find',
        'api::gallery.gallery.findOne',
        'api::team-member.team-member.find',
        'api::team-member.team-member.findOne',
        'api::project.project.find',
        'api::project.project.findOne',
        'api::contact-info.contact-info.find',
        'api::service.service.find',
        'api::service.service.findOne',
        'api::support-info.support-info.find',
      ];

      for (const action of newPermissions) {
        try {
          // Check if permission already exists
          const existingPermission = await strapi
            .query('plugin::users-permissions.permission')
            .findOne({ where: { action } });

          if (!existingPermission) {
            console.log('[Bootstrap] Creating permission:', action);
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: roleId,
              },
            });
          }
        } catch (err) {
          console.error('[Bootstrap] Failed to create permission:', action, err.message);
        }
      }

      console.log('[Bootstrap] Permission setup complete');
    } catch (error) {
      console.error('[Bootstrap] Bootstrap error:', error);
    }
  },
};
