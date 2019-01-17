
const fs = require('fs')

const { getAbsolutePath } = require('../../utils')

const completePath = getAbsolutePath('/solidity/source_files/complete/')
const completeFiles = fs.readdirSync(completePath)

const trufflePath = getAbsolutePath('/solidity/truffle/build/contracts/')
const compiledPath = getAbsolutePath('/solidity/compiled/')

completeFiles.forEach( fileName => {

  if (fileName.search('.sol') !== -1) {

    const compiledFile = fileName.split('.sol')[0] + '.json'

    fs.copyFile(
      trufflePath + compiledFile, compiledPath + compiledFile,
      err => { if (err) throw err }
    )
  }
})
