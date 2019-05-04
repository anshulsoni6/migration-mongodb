let utilities = require('./utilities');

module.exports = async (connectionUrl, dbName, migrationFolder) => {
    try {
        let db = await utilities.createMongoDbConnecion(connectionUrl, dbName);
        await utilities.createMigrationCollection(db);
        let files = await utilities.findFilesInMigrationFolder(migrationFolder);
        let newFiles = await utilities.findNewMigrationFiles(db, files);
        await utilities.runMigrations(db, newFiles, migrationFolder);
    } catch (error) {
        console.log('error: ', error);
    }
};