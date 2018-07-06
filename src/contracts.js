/**
 * Script for getting Truffle contract artifacts from src/contracts
 */

const fs = require('fs')
const path = require('path')

const contractsPath = __dirname + '/default-contracts'

let contracts = {}

let files = fs.readdirSync(contractsPath)

files.forEach( file => {

  split = file.split('.')

  if (split.length != 2 || split[1] !== 'json') {
    throw new Error('contracts: invalid file: ' + file)
  }

  contracts[split[0]] = require(contractsPath + '/' + file)
})

module.exports = contracts
