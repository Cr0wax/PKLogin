import { logEvent } from '../lib/logger.js';
import { dataFilePaths } from '../storage/db.js';
import { writeJsonAtomic } from '../storage/fileStore.js';

export async function resetAllDemoData(): Promise<void> {
  await Promise.all([
    writeJsonAtomic(dataFilePaths.users, []),
    writeJsonAtomic(dataFilePaths.passkeys, []),
    writeJsonAtomic(dataFilePaths.sessions, []),
    writeJsonAtomic(dataFilePaths.challenges, []),
  ]);

  logEvent('demo_data_reset');
}
