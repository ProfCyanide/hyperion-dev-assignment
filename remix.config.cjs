const { vercelPreset } = require('@vercel/remix');

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ...vercelPreset(),
};