/**
 * Factory helper for generating Creator Card payloads and mock documents for tests.
 */

/**
 * Returns a valid public published Creator Card payload.
 * Can be customized using overrides.
 */
function createPayload(overrides = {}) {
  return {
    title: 'George Cooks',
    description: 'Weekly cooking podcast',
    slug: 'george-cooks',
    creator_reference: 'crt_8f2k1m9x4p7w3q5z',
    links: [{ title: 'YouTube', url: 'https://youtube.com/@georgecooks' }],
    service_rates: {
      currency: 'NGN',
      rates: [{ name: 'IG Story Post', description: 'One story mention', amount: 5000000 }],
    },
    status: 'published',
    ...overrides,
  };
}

/**
 * Returns a valid private published Creator Card payload with an access code.
 */
function createPrivatePayload(overrides = {}) {
  return createPayload({
    title: 'VIP Rate Card',
    slug: 'vip-rate-card',
    creator_reference: 'crt_x9y8z7w6v5u4t3s2',
    access_type: 'private',
    access_code: 'A1B2C3',
    ...overrides,
  });
}

/**
 * Returns a valid draft Creator Card payload.
 */
function createDraftPayload(overrides = {}) {
  return createPayload({
    title: 'My Draft Card',
    slug: 'my-draft-card',
    creator_reference: 'crt_m1n2b3v4c5x6z7l8',
    status: 'draft',
    ...overrides,
  });
}

module.exports = {
  createPayload,
  createPrivatePayload,
  createDraftPayload,
};
