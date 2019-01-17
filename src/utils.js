
const path = require('path')

module.exports = {
  getAbsolutePath: getAbsolutePath,
}

/**
 * Converts a relative path to an absolute path.
 *
 * @param {string} relativePath a relative path to a file or folder
 * @returns {string} the same path, but absolute
 */
function getAbsolutePath(relativePath) {
  return path.join(getProjectRootPath() + relativePath)
}

/**
 * Retrieves path to project root folder.
 *
 * @return {string} the current path to the project root folder
 */
function getProjectRootPath() {

  const projectRoot = '/chain-end/'

  let currentDir = __dirname
  if (currentDir.slice(-1) !== '/') currentDir += '/'

  const index = currentDir.lastIndexOf(projectRoot)

  return currentDir.substring(0, index + projectRoot.length)
}
