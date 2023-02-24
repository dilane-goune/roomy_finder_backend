import { ClientSession, startSession } from "mongoose";

export default async function runInTransaction(
  callback: (session: ClientSession) => Promise<any>
) {
  const session: ClientSession = await startSession();

  session.startTransaction();

  try {
    await callback(session);

    // Commit the changes
    await session.commitTransaction();
  } catch (error) {
    // Rollback any changes made in the database
    await session.abortTransaction();

    // logging the error
    console.error(error);

    // Rethrow the error
    throw error;
  } finally {
    // Ending the session
    session.endSession();
  }
}
