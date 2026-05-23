require("dotenv").config();
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../flight_booking.db");

let db = null;
let SQL = null;
let loadedMtime = null;

const getDb = async () => {
    if (!SQL) {
        SQL = await initSqlJs();
    }

    const exists = fs.existsSync(dbPath);
    const mtime = exists ? fs.statSync(dbPath).mtimeMs : null;

    if (!db || loadedMtime !== mtime) {
        if (db) {
            db.close();
            db = null;
        }
        if (exists) {
            db = new SQL.Database(fs.readFileSync(dbPath));
        } else {
            db = new SQL.Database();
        }
        loadedMtime = mtime;
    }

    return db;
};

const saveDb = async () => {
    const database = await getDb();
    fs.writeFileSync(dbPath, database.export());
    loadedMtime = fs.statSync(dbPath).mtimeMs;
};

const query = async (sql, params = []) => {
    const database = await getDb();
    const stmt = database.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
};

const run = async (sql, params = []) => {
    const database = await getDb();
    database.run(sql, params);
    await saveDb();
    return { changes: database.getRowsModified() };
};

const getLastInsertId = async () => {
    const database = await getDb();
    const result = database.exec("SELECT last_insert_rowid() as id");
    return result[0].values[0][0];
};

const closeDb = async () => {
    if (db) {
        fs.writeFileSync(dbPath, db.export());
        db.close();
        db = null;
        loadedMtime = null;
    }
};

module.exports = { query, run, getLastInsertId, closeDb, getDb };
