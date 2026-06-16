/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const { MockModelStubs } = require('@app/mock-models');
const { mockServer } = require('../setup');
const { createPayload, createPrivatePayload } = require('../helpers/creator-card.factory');

describe('POST /creator-cards (Creation)', () => {
  it('Test Case 1 - Full creation: should create a public published card', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      mockNull: true,
    });

    const payload = createPayload();

    const res = await mockServer.post('/creator-cards', { body: payload });

    stub.revert();

    expect(res.statusCode).to.equal(200);
    expect(res.data.status).to.equal('success');
    expect(res.data.message).to.equal('Creator Card Created Successfully.');
    expect(res.data.data).to.have.property('id');
    expect(res.data.data).to.not.have.property('_id');
    expect(res.data.data.slug).to.equal('george-cooks');
    expect(res.data.data.access_type).to.equal('public');
    expect(res.data.data.access_code).to.be.null;
  });

  it('Test Case 2 - Slug auto-generation: should generate slug from title if omitted', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      mockNull: true,
    });

    const payload = {
      title: 'Ada Designs Things',
      creator_reference: 'crt_a1b2c3d4e5f6g7h8',
      status: 'published',
    };

    const res = await mockServer.post('/creator-cards', { body: payload });

    stub.revert();

    expect(res.statusCode).to.equal(200);
    expect(res.data.data.slug).to.equal('ada-designs-things');
  });

  it('Test Case 3 - Private card creation: should succeed with valid access_code', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      mockNull: true,
    });

    const payload = createPrivatePayload();

    const res = await mockServer.post('/creator-cards', { body: payload });

    stub.revert();

    expect(res.statusCode).to.equal(200);
    expect(res.data.data.access_type).to.equal('private');
    expect(res.data.data.access_code).to.equal('A1B2C3');
  });

  it('Test Case 7 - Duplicate slug: should return 400 and SL02 when slug exists', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { slug: 'george-cooks' }, // Simulate existing card
    });

    const payload = createPayload({ title: 'Another George' });

    const res = await mockServer.post('/creator-cards', { body: payload });

    stub.revert();

    expect(res.statusCode).to.equal(400);
    expect(res.data.status).to.equal('error');
    expect(res.data.code).to.equal('SL02');
  });

  it('Test Case 8 - Missing access_code on private card: should return 400 and AC01', async () => {
    const payload = createPrivatePayload({ access_code: undefined });

    const res = await mockServer.post('/creator-cards', { body: payload });

    expect(res.statusCode).to.equal(400);
    expect(res.data.status).to.equal('error');
    expect(res.data.code).to.equal('AC01');
  });

  it('Test Case 9 - access_code on a public card: should return 400 and AC05', async () => {
    const payload = createPayload({ access_code: 'A1B2C3' });

    const res = await mockServer.post('/creator-cards', { body: payload });

    expect(res.statusCode).to.equal(400);
    expect(res.data.status).to.equal('error');
    expect(res.data.code).to.equal('AC05');
  });

  it('Test Case 10 - Framework validation failure: invalid status should return 400', async () => {
    const payload = createPayload({ status: 'archived' });

    const res = await mockServer.post('/creator-cards', { body: payload });

    expect(res.statusCode).to.equal(400);
    expect(res.data.status).to.equal('error');
  });

  it('Test Case 17 - Auto-generated slug collision: should append a suffix if the default slug is taken', async () => {
    const stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      overrideFn(queryData) {
        if (queryData.query && queryData.query.slug === 'ada-designs-things') {
          return { slug: 'ada-designs-things' };
        }
        return null;
      },
    });

    const payload = {
      title: 'Ada Designs Things',
      creator_reference: 'crt_a1b2c3d4e5f6g7h8',
      status: 'published',
    };

    const res = await mockServer.post('/creator-cards', { body: payload });

    stub.revert();

    expect(res.statusCode).to.equal(200);
    expect(res.data.status).to.equal('success');
    expect(res.data.data.slug).to.match(/^ada-designs-things-[a-z0-9]{6}$/);
  });

  describe('Input Validation Failures', () => {
    it('should return 400 when access_type is invalid', async () => {
      const payload = createPayload({ access_type: 'invalid-type' });
      const res = await mockServer.post('/creator-cards', { body: payload });
      expect(res.statusCode).to.equal(400);
      expect(res.data.status).to.equal('error');
    });

    it('should return 400 when creator_reference length is invalid', async () => {
      const payload = createPayload({ creator_reference: 'too-short' }); // not 20 chars
      const res = await mockServer.post('/creator-cards', { body: payload });
      expect(res.statusCode).to.equal(400);
      expect(res.data.status).to.equal('error');
    });

    it('should return 400 when slug format contains spaces or invalid characters', async () => {
      const payload = createPayload({ slug: 'invalid slug format!' });
      const res = await mockServer.post('/creator-cards', { body: payload });
      expect(res.statusCode).to.equal(400);
      expect(res.data.status).to.equal('error');
    });

    it('should return 400 when access_code format is invalid (not 6 alphanumeric characters)', async () => {
      const payload = createPrivatePayload({ access_code: '123' }); // too short
      const res = await mockServer.post('/creator-cards', { body: payload });
      expect(res.statusCode).to.equal(400);
      expect(res.data.status).to.equal('error');
    });

    it('should return 400 when service rate amount is negative', async () => {
      const payload = createPayload({
        service_rates: {
          currency: 'NGN',
          rates: [{ name: 'IG Story Post', description: 'One story mention', amount: -500 }],
        },
      });
      const res = await mockServer.post('/creator-cards', { body: payload });
      expect(res.statusCode).to.equal(400);
      expect(res.data.status).to.equal('error');
    });

    it('should return 400 when service rate currency is invalid', async () => {
      const payload = createPayload({
        service_rates: {
          currency: 'EUR', // invalid currency
          rates: [{ name: 'IG Story Post', description: 'One story mention', amount: 5000000 }],
        },
      });
      const res = await mockServer.post('/creator-cards', { body: payload });
      expect(res.statusCode).to.equal(400);
      expect(res.data.status).to.equal('error');
    });

    it('should return 400 when service rate amount is a decimal', async () => {
      const payload = createPayload({
        service_rates: {
          currency: 'NGN',
          rates: [{ name: 'IG Story Post', description: 'One story mention', amount: 500.5 }],
        },
      });
      const res = await mockServer.post('/creator-cards', { body: payload });
      expect(res.statusCode).to.equal(400);
      expect(res.data.status).to.equal('error');
    });
  });
});
