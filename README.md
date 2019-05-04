# Introduction
Mongo DB Migration is a package to enable migration and seeding with Mongo DB. Its easy to use.

# Installation instructions
```
$ npm install mongodb-migrations --save
```

# How to use this package
Before using this package, create a folder in your project and create migration files in that folder. Note that the name of the migration files must contain `migration` string. For example: create-songs-collection-migration.js is a migration file.
```
example with express.js :-
```

#### app.js
```
var express = require('express')
var app = express()
require('mongodb')

// mongodb migration starts
var mongodbMigrations = require('mongodb-migrations');

var connectionUrl = 'mongodb://localhost:27017'; // mongodb connection url
var dbName = 'myproject'; // db name
var migrationFolder = __dirname + '/migrations'; // path to migration folder
mongodbMigrations(connectionUrl, dbName, migrationFolder); // initialize
// mongodb migration ends

app.get('/', function (req, res) {
  res.send('Hello World')
})
 
app.listen(3000)
```

When app.js executes then all migrations in __dirname + '/migrations' directory execute.

### Migration file example
create-songs-collection-migration.js
```
var songsData = require('./songs.json');
module.exports = async function(db) {
    await db.createCollection('songs');
    await db.collection('songs').insertMany(songsData);
}
```