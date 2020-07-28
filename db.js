const { Db } = require('mongodb');

const MongoClient = require('mongodb').MongoClient;
let db;

function tryConnectAsync() {
  MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost")
  .then(client => db = client.db("zorodb"))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
}

/**
 * @return {Db}
 */
function get() {
  return db;
}

function close() {
  db.close();
}

module.exports = {
  tryConnectAsync,
  get,
  close
}