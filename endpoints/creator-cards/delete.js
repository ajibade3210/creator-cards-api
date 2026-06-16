const { createHandler } = require('@app-core/server');
const deleteService = require('@app/services/creator-cards/delete');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  async handler(rc, helpers) {
    const payload = {
      slug: rc.params.slug,
      creator_reference: rc.body.creator_reference,
    };
    const response = await deleteService(payload);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Creator Card Deleted Successfully.',
      data: response,
    };
  },
});
