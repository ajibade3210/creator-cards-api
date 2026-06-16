const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { CreatorCardMessages } = require('@app/messages');
const CreatorCard = require('@app/repository/creator-card');
const { serializeCreatorCard } = require('./serializer');

const spec = `root {
  slug string
  access_code? string
}`;

const parsedSpec = validator.parse(spec);

async function retrieve(serviceData) {
  const data = validator.validate(serviceData, parsedSpec);

  const card = await CreatorCard.findOne({ query: { slug: data.slug } });

  // 1. If no card with that slug exists (or it is soft-deleted)
  if (!card || card.deleted != null) {
    throwAppError(CreatorCardMessages.NF01, 'NF01');
  }

  // 2. If the card exists but its status is draft
  if (card.status === 'draft') {
    throwAppError(CreatorCardMessages.NF02, 'NF02');
  }

  // 3. If the card is private
  if (card.access_type === 'private') {
    if (!data.access_code) {
      throwAppError(CreatorCardMessages.AC03, 'AC03');
    }
    if (data.access_code !== card.access_code) {
      throwAppError(CreatorCardMessages.AC04, 'AC04');
    }
  }

  return serializeCreatorCard(card);
}

module.exports = retrieve;
