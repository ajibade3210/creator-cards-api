const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { CreatorCardMessages } = require('@app/messages');
const CreatorCard = require('@app/repository/creator-card');
const { serializeCreatorCard } = require('./serializer');

const spec = `root {
  slug string
  creator_reference string<trim|length:20>
}`;

const parsedSpec = validator.parse(spec);

async function deleteCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);

  const card = await CreatorCard.findOne({ query: { slug: data.slug } });

  // If no card with that slug exists (or it's already soft-deleted)
  if (!card || card.deleted != null) {
    throwAppError(CreatorCardMessages.NF01, 'NF01');
  }

  // Ensure the requester owns the card — creator_reference must match the stored value
  if (card.creator_reference !== data.creator_reference) {
    throwAppError('Unauthorized: creator_reference does not match', 'INVLDDATA');
  }

  const now = Date.now();

  await CreatorCard.updateOne({
    query: { _id: card._id },
    updateValues: { deleted: now, updated: now },
    options: { session: options.session },
  });

  card.updated = now;
  card.deleted = now;

  return serializeCreatorCard(card, { includeAccessCode: true });
}

module.exports = deleteCard;
