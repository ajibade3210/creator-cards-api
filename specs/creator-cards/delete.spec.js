/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const { MockModelStubs } = require('@app/mock-models');
const { mockServer } = require('../setup');

describe('DELETE /creator-cards/:slug (Deletion)', () => {
  it('Test Case 6 - Deleting a card: should return 200 and soft-delete card', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: {
        slug: 'ada-designs-things',
        creator_reference: 'crt_a1b2c3d4e5f6g7h8',
        status: 'published',
        deleted: null,
      },
    });

    const res = await mockServer.delete('/creator-cards/ada-designs-things', {
      body: { creator_reference: 'crt_a1b2c3d4e5f6g7h8' },
    });

    stub.revert();

    expect(res.statusCode).to.equal(200);
    expect(res.data.status).to.equal('success');
    expect(res.data.data.deleted).to.not.be.null;
  });

  it('Test Case 15 - Deleting a non-existent card: should return 404 and NF01', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      mockNull: true,
    });

    const res = await mockServer.delete('/creator-cards/does-not-exist-123', {
      body: { creator_reference: 'crt_q1w2e3r4t5y6u7i8' },
    });

    stub.revert();

    expect(res.statusCode).to.equal(404);
    expect(res.data.code).to.equal('NF01');
  });

  it('Test Case 16 - Retrieving a deleted card: should return 404 and NF01', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: {
        slug: 'ada-designs-things',
        deleted: 1767139200000, // Simulated deleted timestamp
      },
    });

    const res = await mockServer.get('/creator-cards/ada-designs-things');

    stub.revert();

    expect(res.statusCode).to.equal(404);
    expect(res.data.code).to.equal('NF01');
  });
});
