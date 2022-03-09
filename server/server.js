import Fastify from 'fastify';

import plugin from './plugin.js';

const fastify = Fastify({
  logger: true,
});

(async () => {
  try {
    const app = await plugin(fastify);
    await fastify.listen(process.env.PORT || 6000, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
