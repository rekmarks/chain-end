
const { getAbsolutePath } = require('../../utils')
const { joinAll } = require('../joinSourceFiles')

if (process.argv.length < 4) {
  throw new Error('Expected at least 2 arguments but received: ' +
    process.argv.length)
}

const metadata = require(getAbsolutePath(process.argv[2]))
const filepaths = require(getAbsolutePath(process.argv[3]))
const inputDir = process.argv.length >= 5 ? process.argv[4] : null
const outputDir = process.argv.length >= 6 ? process.argv[5] : null

joinAll(metadata, filepaths, inputDir, outputDir)
