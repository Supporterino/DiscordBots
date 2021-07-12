module.exports = {
  apps : [{
    name   : "Discord_Bot",
    script : "./build/index.js",
    env_production: {
      NODE_ENV: "production"
    },
    env_development: {
      NODE_ENV: "development"
   }
  }]
}
