const { join } = require('path');

module.exports = {
    webpack: {
        alias: {
            '@': join(__dirname, './src')
        }
    }
}
