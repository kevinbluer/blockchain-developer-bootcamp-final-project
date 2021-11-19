const { ethers } = require("ethers");


export const IS_VALID = (addr) => {
    if (!ethers.utils.isAddress(addr)) {
        return false;
      }
    return true;
}

