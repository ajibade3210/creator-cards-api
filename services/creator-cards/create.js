/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const validator = require('@app-core/validator');
const { ulid } = require('@app-core/randomness');
const { throwAppError } = require('@app-core/errors');
const { CreatorCardMessages } = require('@app/messages');
const CreatorCard = require('@app/repository/creator-card');
const { serializeCreatorCard } = require('./serializer');

const spec = `root {
  title string<trim|minLength:3|maxLength:100>
  description? string<trim|maxLength:500>
  slug? string<trim|minLength:5|maxLength:50>
  creator_reference string<trim|length:20>
  links[]? {
    title string<trim|minLength:1|maxLength:100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|minLength:3|maxLength:100>
      description string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<trim|length:6>
}`;

const parsedSpec = validator.parse(spec);

function generateAlphanumeric(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function create(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);

  // Additional formatting/rule validations
  if (data.links) {
    for (const link of data.links) {
      if (!/^https?:\/\//i.test(link.url)) {
        throwAppError('Invalid link URL format', 'INVLDDATA');
      }
    }
  }

  if (data.service_rates) {
    if (!data.service_rates.rates || data.service_rates.rates.length === 0) {
      throwAppError('Rates must not be empty', 'INVLDDATA');
    }
    for (const rate of data.service_rates.rates) {
      if (!Number.isInteger(rate.amount) || rate.amount <= 0) {
        throwAppError('Rate amount must be a positive integer', 'INVLDDATA');
      }
    }
  }

  // Access rules
  const accessType = data.access_type || 'public';
  if (accessType === 'private') {
    if (!data.access_code) {
      throwAppError(CreatorCardMessages.AC01, 'AC01');
    }
    // access_code must be exactly 6 alphanumeric characters (letters and numbers only)
    if (!/^[a-zA-Z0-9]{6}$/.test(data.access_code)) {
      throwAppError(
        'access_code must be exactly 6 alphanumeric characters (letters and numbers only)',
        'INVLDDATA'
      );
    }
  } else if (data.access_code != null) {
    throwAppError(CreatorCardMessages.AC05, 'AC05');
  }

  // Slug auto-generation or validation
  let { slug } = data;
  if (!slug) {
    const baseSlug = data.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');

    let needSuffix = baseSlug.length < 5;

    if (!needSuffix) {
      const existing = await CreatorCard.findOne({ query: { slug: baseSlug } });
      if (existing) {
        needSuffix = true;
      }
    }

    if (needSuffix) {
      let attempts = 0;
      while (attempts < 10) {
        const suffix = generateAlphanumeric(6);
        const testSlug = baseSlug ? `${baseSlug}-${suffix}` : suffix;
        const existing = await CreatorCard.findOne({ query: { slug: testSlug } });
        if (!existing) {
          slug = testSlug;
          break;
        }
        attempts++;
      }
      if (!slug) {
        slug = `${baseSlug}-${generateAlphanumeric(6)}`;
      }
    } else {
      slug = baseSlug;
    }
  } else {
    if (!/^[a-zA-Z0-9-_]+$/.test(slug) || slug.length < 5 || slug.length > 50) {
      throwAppError('Invalid slug format', 'INVLDDATA');
    }

    const existing = await CreatorCard.findOne({ query: { slug } });
    if (existing) {
      throwAppError(CreatorCardMessages.SL02, 'SL02');
    }
  }

  const now = Date.now();
  const cardId = ulid();

  let newCard;
  try {
    newCard = await CreatorCard.create(
      {
        _id: cardId,
        title: data.title,
        description: data.description || undefined,
        slug,
        creator_reference: data.creator_reference,
        links: data.links || [],
        service_rates: data.service_rates || undefined,
        status: data.status,
        access_type: accessType,
        access_code: accessType === 'private' ? data.access_code : null,
        created: now,
        updated: now,
        deleted: null,
      },
      { session: options.session }
    );
  } catch (err) {
    // MongoDB duplicate key error — slug unique index violation (race condition safety net)
    if (err.code === 11000 && err.keyPattern && err.keyPattern.slug) {
      throwAppError(CreatorCardMessages.SL02, 'SL02');
    }
    throw err;
  }

  return serializeCreatorCard(newCard, { includeAccessCode: true });
}

module.exports = create;
