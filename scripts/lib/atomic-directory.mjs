import { promises as fs } from 'node:fs';
import path from 'node:path';

async function replaceDirectory(sourceDir, targetDir) {
  const backupDir = `${targetDir}.backup-${process.pid}-${Date.now()}`;
  let hasBackup = false;

  await fs.rm(backupDir, { recursive: true, force: true });
  try {
    await fs.rename(targetDir, backupDir);
    hasBackup = true;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      if (['EPERM', 'EBUSY', 'EACCES'].includes(error.code)) {
        await fs.cp(sourceDir, targetDir, { recursive: true, force: true });
        await fs.rm(sourceDir, { recursive: true, force: true });
        return;
      }
      throw error;
    }
  }

  try {
    await fs.rename(sourceDir, targetDir);
  } catch (error) {
    if (hasBackup) await fs.rename(backupDir, targetDir);
    throw error;
  }

  if (hasBackup) await fs.rm(backupDir, { recursive: true, force: true });
}

export async function buildDirectoryAtomically(targetDir, build) {
  const parentDir = path.dirname(targetDir);
  const temporaryDir = path.join(parentDir, `.${path.basename(targetDir)}-build-${process.pid}-${Date.now()}`);

  await fs.rm(temporaryDir, { recursive: true, force: true });
  try {
    await build(temporaryDir);
    await replaceDirectory(temporaryDir, targetDir);
  } catch (error) {
    await fs.rm(temporaryDir, { recursive: true, force: true });
    throw error;
  }
}
