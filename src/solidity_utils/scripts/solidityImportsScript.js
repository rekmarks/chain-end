
const fs = require('fs')

const { getAbsolutePath } = require('../../utils')

const outputFilePath = getAbsolutePath('/src/solidityImports.js')
let outputFileContent = ''

const compiledFiles = fs.readdirSync(getAbsolutePath('/solidity/compiled/'))

compiledFiles.forEach( fileName => {
  if (fileName.search('.json') !== -1) {
    outputFileContent +=
      'module.exports.' + fileName.split('.json')[0] + ' = ' +
      'require(\'../solidity/compiled/' + fileName + '\')\n'
  }
})

fs.writeFileSync(outputFilePath, outputFileContent)
