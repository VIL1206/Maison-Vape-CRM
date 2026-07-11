const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("maison.db", (err) => {
    if (err) {
        console.error("Ошибка подключения к базе:", err.message);
    } else {
        console.log("✅ База данных подключена.");
    }
});

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT,
            name TEXT NOT NULL,
            category TEXT,
            buyPrice REAL DEFAULT 0,
            sellPrice REAL DEFAULT 0,
            quantity INTEGER DEFAULT 0
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            productId INTEGER,
            productName TEXT,
            quantity INTEGER,
            price REAL,
            payment TEXT,
            date TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            productId INTEGER,
            productName TEXT,
            quantity INTEGER,
            supplier TEXT,
            date TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            productId INTEGER,
            productName TEXT,
            oldQuantity INTEGER,
            newQuantity INTEGER,
            difference INTEGER,
            date TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS shift_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cash REAL,
            card REAL,
            telegram REAL,
            total REAL,
            closedAt TEXT
        )
    `);

});

module.exports = db;