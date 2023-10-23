const path = require('path')
module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, '../src/'),
      '@/components': path.resolve(__dirname, '../src/components'),
      '@/hook': path.resolve(__dirname, '../src/hook'),
      api: path.resolve(__dirname, '../src/api'),
    },
  },
}
