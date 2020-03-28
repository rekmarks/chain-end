
module.exports = callInstance

/**
 * Calls the specified function with any specified parameters on the given
 * instance.
 * Must specify a sender unless the instance has a default sender.
 *
 * Throws errors on failure.
 * 
 * @param  {object} instance     the deployed contracted to call
 * @param  {string} functionName the name of the function to call
 * @param  {array}  params       the function parameters (optional)
 * @param  {string} sender       the sender address (optional)
 * @return {?}                   the transaction success return object
 */
async function callInstance (instance, functionName, params=null, sender=null) {

  // input parsing and validation
  if (!instance || !functionName) throw new Error('missing inputs')
  if (!instance.abi || !instance.address)
    throw new Error('callInstance: invalid instance')

  const filtered = instance.abi.filter( entry => entry.name === functionName)

  if (filtered.length > 1)
    throw new Error('callInstance: invalid abi; duplicate function names')
  if (filtered.length < 1)
    throw new Error('callInstance: invalid function name; function not found')
  
  let truffleParams = null
  if (params) {

    if (params.length !== filtered[0].inputs.length)
      throw new Error('callInstance: invalid number of params')

    truffleParams = [].concat(params)

  } else {

    if (filtered[0].inputs.length !== 0)
      throw new Error(
        'callInstance: params are required but none were provided'
      )

    if (sender) truffleParams = []
  }

  if (sender) truffleParams.push({ from: sender })


  // make function call
  // this may throw on failure, let it
  let result
  if (truffleParams)
    result = await instance[functionName](...truffleParams)
  else result = await instance[functionName]()

  // transaction succeeded
  return result
}
