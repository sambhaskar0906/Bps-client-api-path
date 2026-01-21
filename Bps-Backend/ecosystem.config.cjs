module.exports = {
    apps: [
        {
            name: "bharatparcel-api",
            script: "index.js",
            cwd: "/var/www/Bharatparcel/backend",
            env: {
                NODE_ENV: "production",
            }
        }
    ]
};
