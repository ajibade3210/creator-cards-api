const { expect } = require('chai');
const { MockModelStubs } = require('@app/mock-models');
const { mockServer } = require('../setup');

describe('GET /creator-cards/:slug (Retrieval)', () => {
  it('Test Case 4 - Retrieving a public published card: should return 200 with data (excluding access_code)', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: {
        slug: 'george-cooks',
        status: 'published',
        access_type: 'public',
        access_code: null,
        deleted: null,
      },
    });

    const res = await mockServer.get('/creator-cards/george-cooks');

    stub.revert();

    expect(res.statusCode).to.equal(200);
    expect(res.data.status).to.equal('success');
    expect(res.data.data).to.have.property('id');
    expect(res.data.data).to.not.have.property('_id');
    expect(res.data.data).to.not.have.property('access_code');
  });

  it('Test Case 5 - Retrieving a private card with correct pin: should return 200 with data (excluding access_code)', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: {
        slug: 'vip-rate-card',
        status: 'published',
        access_type: 'private',
        access_code: 'A1B2C3',
        deleted: null,
      },
    });

    const res = await mockServer.get('/creator-cards/vip-rate-card', {
      query: { access_code: 'A1B2C3' },
    });

    stub.revert();

    expect(res.statusCode).to.equal(200);
    expect(res.data.data).to.not.have.property('access_code');
  });

  it('Test Case 11 - Retrieving a non-existent card: should return 404 and NF01', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      mockNull: true,
    });

    const res = await mockServer.get('/creator-cards/does-not-exist-123');

    stub.revert();

    expect(res.statusCode).to.equal(404);
    expect(res.data.status).to.equal('error');
    expect(res.data.code).to.equal('NF01');
  });

  it('Test Case 12 - Retrieving a draft card: should return 404 and NF02', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: {
        slug: 'my-draft-card',
        status: 'draft',
        deleted: null,
      },
    });

    const res = await mockServer.get('/creator-cards/my-draft-card');

    stub.revert();

    expect(res.statusCode).to.equal(404);
    expect(res.data.code).to.equal('NF02');
  });

  it('Test Case 13 - Retrieving a private card without a pin: should return 403 and AC03', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: {
        slug: 'vip-rate-card',
        status: 'published',
        access_type: 'private',
        access_code: 'A1B2C3',
        deleted: null,
      },
    });

    const res = await mockServer.get('/creator-cards/vip-rate-card');

    stub.revert();

    expect(res.statusCode).to.equal(403);
    expect(res.data.code).to.equal('AC03');
  });

  it('Test Case 14 - Retrieving a private card with a wrong pin: should return 403 and AC04', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: {
        slug: 'vip-rate-card',
        status: 'published',
        access_type: 'private',
        access_code: 'A1B2C3',
        deleted: null,
      },
    });

    const res = await mockServer.get('/creator-cards/vip-rate-card', {
      query: { access_code: 'WRONG1' },
    });

    stub.revert();

    expect(res.statusCode).to.equal(403);
    expect(res.data.code).to.equal('AC04');
  });

  it('Test Case 18 - Verify retrieval order: draft takes precedence over private check (should return 404 and NF02)', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: {
        slug: 'private-draft-card',
        status: 'draft',
        access_type: 'private',
        access_code: 'A1B2C3',
        deleted: null,
      },
    });

    const res = await mockServer.get('/creator-cards/private-draft-card');

    stub.revert();

    expect(res.statusCode).to.equal(404);
    expect(res.data.status).to.equal('error');
    expect(res.data.code).to.equal('NF02');
  });
});
