/**
 * Serializes a Creator Card model or document into the format expected by the API.
 * Handles id mapping, stripping internal MongoDB _id, formatting sub-documents, and optionally including/omitting private fields.
 *
 * @param {Object} card - The Creator Card raw database document or model object.
 * @param {Object} [options] - Options configuration.
 * @param {Boolean} [options.includeAccessCode=false] - Whether to include the access_code field (e.g., on create/delete but not retrieve).
 * @returns {Object|null} The serialized Creator Card object, or null if no card was provided.
 */
function serializeCreatorCard(card, options = {}) {
  if (!card) return null;

  const includeAccessCode = options.includeAccessCode || false;

  const result = {
    id: card._id || card.id,
    title: card.title,
    description: card.description,
    slug: card.slug,
    creator_reference: card.creator_reference,
    links: card.links || [],
    service_rates: card.service_rates,
    status: card.status,
    access_type: card.access_type || 'public',
    created: card.created,
    updated: card.updated,
    deleted: card.deleted,
  };

  if (includeAccessCode) {
    result.access_code = card.access_code !== undefined ? card.access_code : null;
  }

  return result;
}

module.exports = {
  serializeCreatorCard,
};
