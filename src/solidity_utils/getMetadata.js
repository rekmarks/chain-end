
const { PythonShell } = require('python-shell')
const timestamp = require('time-stamp')

const { getAbsolutePath } = require('../utils')

module.exports = {
  getMetadata: getMetadata,
}

/**
 * getMetadata
 *
 * @param {string} solidityRootDir root of directory containing solidity files
 * @param {string} destinationFolder folder where outputs will be written
 * @param {string} pythonPath path to local python installation, if needed
 * @returns {object} paths to the output files if parameters provided, else
 * true
 */
function getMetadata (
  solidityRootDir,
  destinationFolder=null,
  pythonPath=null
) {

  if (!solidityRootDir) throw new Error('Missing Solidity root dir.')

  if (!destinationFolder) {
    destinationFolder = getAbsolutePath('solidity/metadata/')
  }

  // for the user's convenience
  if (destinationFolder.slice(-1) !== '/') {
    destinationFolder = destinationFolder.concat('/')
  }

  // PythonShell options
  const options = {
    mode: 'json',
  }

  // define output file paths
  time = timestamp('YYYY-MM-DD@HH:mm:ss')
  out1 = destinationFolder + 'SolidityMetadata' + time + '.json'
  out2 = destinationFolder + 'SolidityFilepaths' + time + '.json'

  // set arguments to python script
  options.args = [solidityRootDir, out1, out2]

  if (pythonPath) { options.pythonPath = pythonPath }

  const results = { paths: { metadata: out1, filepaths: out2 } }

  PythonShell.run(
    getAbsolutePath('/src/solidity_utils/get_metadata.py'),
    options,
    (err, messages) => { if (err) throw err }
  )
}

/**
 * TODO
 * For use in refactor to true JS module as opposed to command line utility.
 */
function validatePyShellMessages (error, messages) {

  if (err) throw err
  if (!messages || messages.length < 2) {
    throw new Error('Expected at least 2 messages from Python process but ' +
      'received: ' + messages.length
    )
  }
  if (
    Object.keys(messages[0]).length === 0 ||
    Object.keys(messages[1]).length === 0
  ) {
    throw new Error('Received empty message(s).')
  }

  const results = {
    json: { metadata: null, filepaths: null },
    paths: { metadata: out1, filepaths: out2 },
  }

  results.json.metadata = messages[0]
  results.json.filepaths = messages[1]

  if (messages.length > 2) {
    console.log('Additional messages received from Python process:')
    for (const m in messages.slice(2)) { console.log(m) }
  }
}
