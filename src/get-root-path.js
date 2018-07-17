
module.exports = getRootPath()

/**
 * Retrieves path to project root folder using __dirname
 * @return {string} the current path to the project root folder
 */
function getRootPath() {

  const projectRoot = '/chain-end'

  const currentDir = __dirname
  const index = currentDir.lastIndexOf(projectRoot)

  return currentDir.substring(0, index + projectRoot.length)
}
