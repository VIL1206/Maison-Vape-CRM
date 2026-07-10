const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("maison.db", (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("База данных подключена.");
    }
});

// Создаем таблицу товаров
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT,
            name TEXT,
            category TEXT,
            buyPrice REAL,
            sellPrice REAL,
            quantity INTEGER
        )
    `);
});
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

module.exports = db;