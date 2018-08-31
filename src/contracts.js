/**
 * Script for getting Truffle contract artifacts from all contracts 
 * in src/default-contracts
 */

const fs = require('fs')
const path = require('path')

const contractsPath = __dirname + '/default-contracts'

let contracts = {}

let files = fs.readdirSync(contractsPath)

files.forEach( fileName => {

  split = fileName.split('.')

  if (split.length !== 2) {
    throw new Error('contracts: invalid file', fileName)
  }
  else if (split[1] === 'json') {
    contracts[split[0]] = require(contractsPath + '/' + fileName)  
  }
  else {} // do nothing
  
})

module.exports = contracts
