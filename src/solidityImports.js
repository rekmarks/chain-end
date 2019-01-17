
const fs = require('fs')

const { getAbsolutePath } = require('./utils.js')

const compiledPath = getAbsolutePath('/solidity/compiled/')
const compiledFiles = fs.readdirSync(compiledPath)

compiledFiles.forEach( fileName => {
  if (fileName.search('.json') !== -1) {
    const entityName = fileName.split('.json')[0]
    module.exports[entityName] = require(compiledPath + fileName)
  }
})
