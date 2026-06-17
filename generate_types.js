const fs = require('fs');
const path = require('path');

const types = [
  {
    name: 'hero-image',
    displayName: 'Hero Image',
    collectionName: 'hero_images',
    attributes: {
      title: { type: 'string', required: true },
      description: { type: 'text' },
      image: { type: 'media', multiple: false, allowedTypes: ['images'] },
      is_active: { type: 'boolean', default: true },
      display_order: { type: 'integer', default: 0 }
    }
  },
  {
    name: 'site-content',
    displayName: 'Site Content',
    collectionName: 'site_contents',
    attributes: {
      key: { type: 'string', required: true, unique: true },
      title: { type: 'string' },
      content: { type: 'text' }
    }
  },
  {
    name: 'event',
    displayName: 'Event',
    collectionName: 'events',
    attributes: {
      title: { type: 'string', required: true },
      description: { type: 'text' },
      image: { type: 'media', multiple: false, allowedTypes: ['images'] },
      event_date: { type: 'datetime' }
    }
  },
  {
    name: 'registration',
    displayName: 'Registration',
    collectionName: 'registrations',
    attributes: {
      first_name: { type: 'string', required: true },
      last_name: { type: 'string', required: true },
      gender: { type: 'string' },
      expectation: { type: 'text' },
      email: { type: 'email', required: true },
      phone: { type: 'string' },
      event: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::event.event',
        inversedBy: 'registrations'
      }
    }
  },
  {
    name: 'gallery',
    displayName: 'Gallery',
    collectionName: 'galleries',
    attributes: {
      title: { type: 'string', required: true },
      image: { type: 'media', multiple: false, allowedTypes: ['images'] }
    }
  },
  {
    name: 'team-member',
    displayName: 'Team Member',
    collectionName: 'team_members',
    attributes: {
      name: { type: 'string', required: true },
      position: { type: 'string', required: true },
      bio: { type: 'text' },
      image: { type: 'media', multiple: false, allowedTypes: ['images'] }
    }
  },
  {
    name: 'project',
    displayName: 'Project',
    collectionName: 'projects',
    attributes: {
      title: { type: 'string', required: true },
      description: { type: 'text' },
      image: { type: 'media', multiple: false, allowedTypes: ['images'] },
      is_featured: { type: 'boolean', default: false }
    }
  }
];

const basePath = path.join(__dirname, 'src', 'api');

types.forEach(type => {
  const dirPath = path.join(basePath, type.name);
  const pluralName = type.name + 's';
  if (['gallery'].includes(type.name)) {
      // proper pluralization check but galleries is defined in collectionName
  }
  const pluralNameGen = ['gallery'].includes(type.name) ? 'galleries' : type.name + 's';

  // Create directories
  ['content-types', 'controllers', 'services', 'routes'].forEach(subDir => {
    fs.mkdirSync(path.join(dirPath, subDir, subDir === 'content-types' ? type.name : ''), { recursive: true });
  });

  // 1. schema.json
  const schema = {
    kind: 'collectionType',
    collectionName: type.collectionName,
    info: {
      singularName: type.name,
      pluralName: pluralNameGen,
      displayName: type.displayName,
      description: ''
    },
    options: {
      draftAndPublish: false
    },
    pluginOptions: {},
    attributes: type.attributes
  };
  fs.writeFileSync(
    path.join(dirPath, 'content-types', type.name, 'schema.json'),
    JSON.stringify(schema, null, 2)
  );

  // 2. controller
  const controllerTpl = `/**
 * ${type.name} controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::${type.name}.${type.name}');
`;
  fs.writeFileSync(path.join(dirPath, 'controllers', `${type.name}.ts`), controllerTpl);

  // 3. service
  const serviceTpl = `/**
 * ${type.name} service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::${type.name}.${type.name}');
`;
  fs.writeFileSync(path.join(dirPath, 'services', `${type.name}.ts`), serviceTpl);

  // 4. route
  const routeTpl = `/**
 * ${type.name} router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::${type.name}.${type.name}');
`;
  fs.writeFileSync(path.join(dirPath, 'routes', `${type.name}.ts`), routeTpl);

  console.log(`Created structure for ${type.name}`);
});

// Since Registration has a relation to Event, we should update Event's schema to have the inverse relation.
const eventSchemaPath = path.join(basePath, 'event', 'content-types', 'event', 'schema.json');
if (fs.existsSync(eventSchemaPath)) {
    const eventSchema = JSON.parse(fs.readFileSync(eventSchemaPath, 'utf8'));
    eventSchema.attributes.registrations = {
        type: "relation",
        relation: "oneToMany",
        target: "api::registration.registration",
        mappedBy: "event"
    };
    fs.writeFileSync(eventSchemaPath, JSON.stringify(eventSchema, null, 2));
    console.log('Updated event schema with relation');
}
