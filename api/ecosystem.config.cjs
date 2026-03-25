module.exports = {
    apps: [
        {
            name: 'api.qp.uttirna.in',
            script: 'app.js',
            instances: 1,
            autorestart: true,
            watch: true,
            ignore_watch: ['node_modules', 'logs', 'pdf'],
            mode: 'fork',
            max_memory_restart: '500M',
            env: {},
            env_production: {},
        },
    ],
};
