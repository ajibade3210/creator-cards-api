const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'creatorCards';

/**
 * @typedef {Object} CreatorCardSchema
 * @property {String} _id
 * @property {String} title
 * @property {String} [description]
 * @property {String} slug
 * @property {String} creator_reference
 * @property {Array<{title: String, url: String}>} [links]
 * @property {{currency: String, rates: Array<{name: String, description: String, amount: Number}>}} [service_rates]
 * @property {String} status
 * @property {String} access_type
 * @property {String} [access_code]
 * @property {Number} created
 * @property {Number} updated
 * @property {Number|null} deleted
 */

const schemaConfig = {
  _id: { type: SchemaTypes.ULID, required: true },
  title: { type: SchemaTypes.String, required: true },
  description: { type: SchemaTypes.String },
  slug: { type: SchemaTypes.String, unique: true, index: true },
  creator_reference: { type: SchemaTypes.String, required: true, index: true },
  links: { type: SchemaTypes.Mixed }, // Array of objects
  service_rates: { type: SchemaTypes.Mixed }, // Currency and rates array
  status: { type: SchemaTypes.String, required: true, index: true }, // 'draft' | 'published'
  access_type: { type: SchemaTypes.String, required: true, default: 'public' }, // 'public' | 'private'
  access_code: { type: SchemaTypes.String, default: null },
  created: { type: SchemaTypes.Number, required: true },
  updated: { type: SchemaTypes.Number, required: true },
  deleted: { type: SchemaTypes.Number, default: null },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

// Compound index to optimise the most frequent query: look up an active card by slug
// Both retrieval and delete queries filter on { slug, deleted } simultaneously
modelSchema.index({ deleted: 1, slug: 1 });

module.exports = DatabaseModel.model(modelName, modelSchema);
