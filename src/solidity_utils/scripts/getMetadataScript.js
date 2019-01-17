
const { getMetadata } = require('../getMetadata')

if (process.argv.length < 3) {
  throw new Error('Expected at least 1 argument but received: ' +
    process.argv.length)
}

getMetadata(...process.argv.slice(2))
