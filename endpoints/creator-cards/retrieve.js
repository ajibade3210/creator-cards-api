const { createHandler } = require('@app-core/server');
const retrieveService = require('@app/services/creator-cards/retrieve');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  async handler(rc, helpers) {
    const payload = {
      slug: rc.params.slug,
      access_code: rc.query.access_code,
    };
    const response = await retrieveService(payload);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Creator Card Retrieved Successfully.',
      data: response,
    };
  },
});
