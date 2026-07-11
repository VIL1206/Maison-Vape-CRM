require("dotenv").config();

const db = require("./database");

async function init() {

    await db.query(`
        CREATE TABLE IF NOT EXISTS products(
            id SERIAL PRIMARY KEY,
            barcode TEXT,
            name TEXT NOT NULL,
            category TEXT,
            buyPrice REAL DEFAULT 0,
            sellPrice REAL DEFAULT 0,
            quantity INTEGER DEFAULT 0
        );
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS sales(
            id SERIAL PRIMARY KEY,
            productId INTEGER,
            productName TEXT,
            quantity INTEGER,
            price REAL,
            payment TEXT,
            date TIMESTAMP
        );
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS deliveries(
            id SERIAL PRIMARY KEY,
            productId INTEGER,
            productName TEXT,
            quantity INTEGER,
            supplier TEXT,
            date TIMESTAMP
        );
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS inventory(
            id SERIAL PRIMARY KEY,
            productId INTEGER,
            productName TEXT,
            oldQuantity INTEGER,
            newQuantity INTEGER,
            difference INTEGER,
            date TIMESTAMP
        );
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS shift_reports(
            id SERIAL PRIMARY KEY,
            cash REAL,
            card REAL,
            telegram REAL,
            total REAL,
            closedAt TIMESTAMP
        );
    `);

    console.log("✅ Все таблицы созданы");

    process.exit();

}

init();