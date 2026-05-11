module.exports = {
  apps: [
    {
      name: "seaaveybot",
      script: "index.ts",
      interpreter: "bun",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
