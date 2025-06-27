/** @type {import('@remix-run/dev').AppConfig} */
const { vercelPreset } = require("@vercel/remix");

module.exports = {
  ...vercelPreset(),
}; 