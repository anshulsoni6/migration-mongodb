let fs = require('fs');
let constants = require('./default.json');

let exportUtilities = {
    createMongoDbConnecion: (connectionUrl, dbName) => {
        return new Promise((resolve, reject) => {
            try {
                let MongoClient = require('mongodb').MongoClient;
                // Use connect method to connect to the server
                MongoClient.connect(connectionUrl, async function (err, client) {
                    if (err) {
                        console.log('Error: Could not connect to mongodb server  : ', err);
                    }
                    console.log('Connected successfully to mongoDB server ');
                    let db = client.db(dbName);

                    // client.close();
                    resolve(db);
                });
            } catch (error) {
                reject(error);
            }
        });
    },
    createMigrationCollection: (db) => {
        return new Promise((resolve, reject) => {
            db.listCollections({}, 1).toArray(function (err, data) {
                if (err) {
                    return reject(err);
                }
                let collectionsName = [];
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    collectionsName.push(element.name);
                }
                if (collectionsName && collectionsName.indexOf(constants.migrationCollectionName) === -1) {
                    db.createCollection(constants.migrationCollectionName, (err, data) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(data);
                    });
                }
                return resolve();
            });
        });
    },
    findFilesInMigrationFolder: (migrationFolder) => {
        let allFiles = fs.readdirSync(migrationFolder);
        let migrationFiles = [];
        for (let index = 0; index < allFiles.length; index++) {
            const element = allFiles[index];
            if (element.toLowerCase().search(constants.migration) !== -1) {
                migrationFiles.push(element);
            }

        }
        return migrationFiles;
    },
    findNewMigrationFiles: async (db, allFiles) => {
        let newFiles = [];
        if (allFiles && allFiles.length) {
            let allExecutedMigrations = await db.collection(constants.migrationCollectionName).find({}, {
                migration: 1,
                _id: 0
            }).toArray();
            if (!allExecutedMigrations.length) { // no migration is executed yet
                newFiles = allFiles;
            }
            for (let index = 0; index < allExecutedMigrations.length; index++) {
                const element = allExecutedMigrations[index];
                let foundIndex = allFiles.indexOf(element.migration);
                if (foundIndex !== -1) { // found
                    allFiles.splice(foundIndex, 1);
                }
            }
        }
        newFiles = allFiles;
        if (!newFiles.length) {
            db.close();
        }
        return newFiles;
    },
    runMigrations: async (db, newFiles, migrationFolder) => {
        try {
            var migrations = [];
            var migrationName = '';
            if (newFiles && newFiles.length) {
                for (let index = 0; index < newFiles.length; index++) {
                    const element = newFiles[index];
                    migrationName = element;
                    let migration = require(`${migrationFolder}/${element}`);
                    await migration(db);
                    migrations.push({
                        migration: element,
                        createdAt: new Date()
                    });
                    console.log('\x1b[32m', `========================== migration ${migrationName} executed successfully ==========================`);
                }
                await db.collection(constants.migrationCollectionName).insertMany(migrations);
            }
            db.close();
        } catch (error) {
            await db.collection(constants.migrationCollectionName).insertMany(migrations);
            db.close();
            console.log('\x1b[31m', `========================== migration ${migrationName} failed!!! ==========================`);
        }
    }
};


module.exports = exportUtilities;