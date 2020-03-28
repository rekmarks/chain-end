
const contractParameters = {
  token: {
    StandardERC20: {
      'a': [
        'BrittBrunoBux',
        'BBX',
        18,
        12000,
      ],
      'b': [
        'SuneBrunoBux',
        'SBX',
        20,
        21000,
      ],
    }
  }
}

module.exports.asNumber = bn => {
  return bn.toNumber()
}

module.exports.contractParameters = contractParameters
