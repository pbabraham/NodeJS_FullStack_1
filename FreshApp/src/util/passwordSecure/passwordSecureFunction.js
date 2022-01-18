const bcrypt = require('bcrypt');

const passwordHash=async(myPlaintextPassword,saltRounds)=>{
    let hash=await bcrypt.hash(myPlaintextPassword, saltRounds)
    return hash
}


const passwordMatch=async(someOtherPlaintextPassword,hash)=>{
    let check=await bcrypt.compare(someOtherPlaintextPassword,hash)
    return check
}

module.exports={passwordHash,passwordMatch}