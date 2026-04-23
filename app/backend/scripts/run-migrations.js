const dataSourceModule = require('../dist/database/data-source');
const dataSource = dataSourceModule.default ?? dataSourceModule;

async function main() {
  await dataSource.initialize();
  await dataSource.runMigrations();
}

main()
  .then(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  })
  .catch(async (error) => {
    console.error('[backend] Migration step failed.');
    console.error(error);

    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    process.exit(1);
  });
