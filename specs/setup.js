process.env.USE_MOCK_MODEL = '1';
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');

// Create and export the mock server instance configured with the creator-cards endpoints
const mockServer = createMockServer(['endpoints/creator-cards']);

// Global clean up of stubs after each test run to avoid stub-pollution
afterEach(() => {
  if (
    MockModelStubs.CreatorCard &&
    MockModelStubs.CreatorCard.findOne &&
    typeof MockModelStubs.CreatorCard.findOne.default.revert === 'function'
  ) {
    try {
      MockModelStubs.CreatorCard.findOne.default.revert();
    } catch (e) {
      // Ignore if stubs were not active or already reverted in the test
    }
  }
});

module.exports = {
  mockServer,
};
