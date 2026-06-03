module.exports = {
  apps: [
    {
      name: "downloader-backend",
      cwd: "./backend",
      script: "src/app.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      watch: false,
      max_memory_restart: "300M"
    }
  ]
};
