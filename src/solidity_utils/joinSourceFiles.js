
const fs = require('fs')

const eol = require('eol')

const { getAbsolutePath } = require('../utils')

const solTypeEnum = {
  contract: 0,
  library: 1,
  interface: 2,
}

module.exports = {
  joinAll: joinAllSourceFiles,
  join: writeJoinedSourceFile,
}

/**
 * Calls writeJoinedSourceFile on all .sol files in inputDir (non-recursively).
 *
 * @param {object} solMetadata all Solidity source files' metadata, by name
 * @param {object} solPaths the paths to the Solidity source files, by name
 * @param {string} inputDir the path to the input directory
 * @param {string} outputDir the path to the output directory
 */
function joinAllSourceFiles (
  solMetadata, solPaths, inputDir=null, outputDir=null
) {

  if (!inputDir) {
    inputDir = getAbsolutePath('/solidity/source_files/raw')
  }

  const inputFiles = fs.readdirSync(inputDir)

  inputFiles.forEach( fileName => {
    if (fileName.search('.sol') !== -1) {
      const entityName = fileName.split('.sol')[0]
      writeJoinedSourceFile(entityName, solMetadata, solPaths, outputDir)
    }
  })
}

/**
 * Takes in the name of a target Solidity entity and the metadata of it and all
 * its dependencies, and writes all sources to a single .sol file on disk.
 * Expects output from getMetadata.
 *
 * @param {string} targetName name of target Solidity entity, e.g. ERC20Token
 * @param {object} solMetadata all Solidity source files' metadata, by name
 * @param {object} solPaths the paths to the Solidity source files, by name
 * @param {string} outputDir the path to the output directory
 */
function writeJoinedSourceFile (
  targetName, solMetadata, solPaths, outputDir=null
) {

  if(!outputDir) {
    outputDir = getAbsolutePath('/solidity/source_files/complete/')
  }

  // in case the user forgot
  if (outputDir.slice(-1) !== '/') outputDir += '/'

  // get all dependencies and their sources
  const { sources, order } = getDependencySources(
    [solMetadata[targetName]], solMetadata, solPaths
  )

  // initialize output string, add  pragma statement
  let output =
    '\n' +
    getPragmaStatement(solMetadata[targetName].solidityVersion) +
    '\n'

  for (const sourceName of order) {

    // split undifferentiated source by lines
    let source = eol.split(sources[sourceName])

    for (const line of source) {

      // ignore pragma and import statements
      if (line.search('pragma') === 0 || line.search('import') === 0) {
        continue
      }
      // store line
      output += line + '\n'
    }
    output += '\n' // add extra newline before next source
  }

  // ensure all text is separated by at most two newlines
  output = output.replace(/\n{3,}/g, '\n\n')

  // trim terminating newlines
  output = output.replace(/\n+$/, '')

  fs.writeFileSync(outputDir + targetName + '.sol', output)
}

/**
 * Recursively gets all dependencies and the contents of their source files as
 * strings for the Solidity entity (or entities) whose name is passed in the
 * remainingDeps array.
 *
 * @param {array} remainingDeps remaining entities whose dependencies must be
 * processed, pass in target entity's metadata object
 * @param {object} solMetadata the metadata of all Solidity entities
 * @param {object} filepaths filepaths by entity names, for all entities
 * @param {array} allDeps an empty array (default)
 * @param {object} depSources an empty object (default)
 * @returns {object} an object with complete dependency sources and an array
 * defining their order
 */
function getDependencySources(
  remainingDeps, solMetadata, filepaths, allDeps=[], depSources={}
) {

  // base case
  if (remainingDeps.length === 0) {
    // poor man's topsort pt.2
    allDeps.reverse()
    allDeps.sort( (x, y) => {
      return solTypeEnum[solMetadata[y].type] - solTypeEnum[solMetadata[x].type]
    })
    return { sources: depSources, order: allDeps }
  }

  // remove first element of remainingDeps
  const inheritable = remainingDeps.shift()

  // if we have yet to see this entity
  if (!depSources.hasOwnProperty(inheritable.name)) {

    // defensive programming
    if (!filepaths[inheritable.name]) {
      throw new Error(
        'Inheritable "' + inheritable.name + '" not in filepaths.'
      )
    }

    // add contract source to depSources, and its name to allDeps
    depSources[inheritable.name] = fs.readFileSync(
      filepaths[inheritable.name], 'utf8'
    )
    allDeps.push(inheritable.name)

    // add current item's dependencies to the remainingDeps array
    for (const dependency of inheritable['dependencies']) {
      remainingDeps.push(solMetadata[dependency])
    }
  }
  else {
    // poor man's topsort pt.1
    let index = allDeps.indexOf(inheritable.name)
    if (index > -1) {
      allDeps.splice(index, 1)
      allDeps.push(inheritable.name)
    }
  }
  return getDependencySources(
    remainingDeps, solMetadata, filepaths, allDeps, depSources
  )
}

/**
 * Tales a solidity version string and returns a complete pragma statement with
 * a terminating newline.
 *
 * @param {string} solidityVersion e.g. "^0.5.0"
 * @returns {string} e.g. "pragma solidity ^0.5.0;\n"
 */
function getPragmaStatement(solidityVersion) {
  return 'pragma solidity ' + solidityVersion +';\n'
}
