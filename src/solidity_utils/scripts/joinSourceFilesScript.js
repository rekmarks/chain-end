
const { join } = require('../joinSourceFiles')

if (process.argv.length < 5) {
  throw new Error('Expected at least 3 arguments but received: ' +
    process.argv.length)
}

const metadata = require(process.argv[3])
const filepaths = require(process.argv[4])
const outputDir = process.argv.length >= 6 ? process.argv[5] : '.'

join(process.argv[2], metadata, filepaths, outputDir)
