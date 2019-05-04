let utilities = require('./utilities');

module.exports = async (connectionUrl, dbName, migrationFolder) => {
    try {
        let { db, client } = await utilities.createMongoDbConnecion(connectionUrl, dbName);
        await utilities.createMigrationCollection(db);
        let files = await utilities.findFilesInMigrationFolder(migrationFolder);
        let newFiles = await utilities.findNewMigrationFiles(client, db, files);
        await utilities.runMigrations(client, db, newFiles, migrationFolder);
    } catch (error) {
        console.log('\x1b[31m error: ', error);
    }
};