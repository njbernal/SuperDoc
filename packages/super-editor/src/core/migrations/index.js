import { migration_after_0_4_14 } from './migration_after_0_4_14';

const DOCUMENT_MIGRATIONS = {
  'initial': migration_after_0_4_14,
  '0.4.14': migration_after_0_4_14,
};

export const getNecessaryMigrations = (version) => {
  if (version === 'initial') return Object.values(DOCUMENT_MIGRATIONS);
  if (version === '0.4.14') return Object.values(DOCUMENT_MIGRATIONS);
};