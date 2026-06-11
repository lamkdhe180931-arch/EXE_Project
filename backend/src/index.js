require('dotenv').config();
const { createApp } = require('./app');
const { prisma } = require('./lib/prisma');

const PORT = process.env.PORT || 3000;
const app = createApp(prisma);

app.listen(PORT, () => {
  console.log(`Artdict API running on http://localhost:${PORT}`);
});
