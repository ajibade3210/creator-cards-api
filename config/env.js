const Joi = require('joi');
const dotenv = require('dotenv');

if (!process.env.__ALREADY_BOOTSTRAPPED_ENVS) {
  dotenv.config();
}

const envSchema = Joi.object({
  PORT: Joi.number().integer().required(),
  MONGODB_URI: Joi.string()
    .uri({ scheme: ['mongodb', 'mongodb+srv'] })
    .when('USE_MOCK_MODEL', {
      is: '1',
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
  CAN_LOG_ENDPOINT_INFORMATION: Joi.any(),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);
if (error) {
  console.error(`Startup Error: Environment validation failed: ${error.message}`);
  process.exit(1);
}

module.exports = {
  PORT: Number(value.PORT),
  MONGODB_URI: value.MONGODB_URI,
  CAN_LOG_ENDPOINT_INFORMATION: value.CAN_LOG_ENDPOINT_INFORMATION,
};
