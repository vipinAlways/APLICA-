import { db } from "../db";

export const clearVerificationTokens = async()=>{
    try{
       await db.verificationToken.deleteMany({
  where: {
    expires: {
      lt: new Date(),
    },
  },
});
    }catch(error:string | unknown){
        throw new Error(`Failed to clear verification tokens: ${error}`);
    }
}