import { db } from "../db";

export const clearVerificationTokens = async () => {
  try {
    await db.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to clear verification tokens:`, { cause: error });
  }
};
