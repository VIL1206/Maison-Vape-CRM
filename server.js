const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
app.use(express.json());
const PORT = 3000;

// Разрешаем отдавать файлы из папки public
app.use(express.static(path.join(__dirname, "public")));

// Главная страница
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Проверка работы сервера
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Сервер работает!"
    });
});

// Запуск сервера
// Получить все товары
app.get("/api/products", (req, res) => {

    db.all(
        "SELECT * FROM products ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);

        }
    );

});

// Добавить товар
app.post("/api/products", (req, res) => {

    const {
        barcode,
        name,
        category,
        buyPrice,
        sellPrice,
        quantity
    } = req.body;

    db.run(
        `INSERT INTO products
        (barcode,name,category,buyPrice,sellPrice,quantity)
        VALUES(?,?,?,?,?,?)`,
        [
            barcode,
            name,
            category,
            buyPrice,
            sellPrice,
            quantity
        ],
        function (err) {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                id: this.lastID
            });

        }
    );

});
// Удалить товар
app.delete("/api/products/:id", (req, res) => {

    db.run(
        "DELETE FROM products WHERE id = ?",
        [req.params.id],
        function(err){

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                success:true
            });

        });

});
// Обновить товар
app.put("/api/products/:id", (req, res) => {

    const {
        barcode,
        name,
        category,
        buyPrice,
        sellPrice,
        quantity
    } = req.body;

    db.run(
        `UPDATE products
        SET
            barcode = ?,
            name = ?,
            category = ?,
            buyPrice = ?,
            sellPrice = ?,
            quantity = ?
        WHERE id = ?`,
        [
            barcode,
            name,
            category,
            buyPrice,
            sellPrice,
            quantity,
            req.params.id
        ],
        function(err){

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                success:true
            });

        });

});
// Продажа товаров
app.post("/api/sale", async (req, res) => {

    const { cart, payment } = req.body;

    if (!cart || cart.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Корзина пустая"
        });
    }

    const now = new Date().toLocaleString();

    let completed = 0;

    cart.forEach(product => {

        db.run(
            `INSERT INTO sales
            (productId, productName, quantity, price, payment, date)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                product.id,
                product.name,
                1,
                product.sellPrice,
                payment,
                now
            ]
        );

        db.run(
            `UPDATE products
            SET quantity = quantity - 1
            WHERE id = ?`,
            [product.id],
            function(err){

                completed++;

                if(completed === cart.length){

                    res.json({
                        success:true
                    });

                }

            });

    });

});
// Получить кассу
app.get("/api/cash", (req, res) => {

    db.all(
        "SELECT payment, SUM(price) as total FROM sales GROUP BY payment",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);

        }

    );

});
// Прием товара
app.post("/api/delivery", (req, res) => {

    const {
        productId,
        quantity,
        supplier
    } = req.body;

    const now = new Date().toLocaleString();

    db.get(
        "SELECT * FROM products WHERE id=?",
        [productId],
        (err, product) => {

            if (err || !product) {
                return res.status(404).json({
                    success:false
                });
            }

            db.run(
                "UPDATE products SET quantity = quantity + ? WHERE id=?",
                [quantity, productId]
            );

            db.run(
                `INSERT INTO deliveries
                (productId,productName,quantity,supplier,date)
                VALUES(?,?,?,?,?)`,
                [
                    productId,
                    product.name,
                    quantity,
                    supplier,
                    now
                ]
            );

            res.json({
                success:true
            });

        });

});
// Переучет товара
app.post("/api/inventory", (req, res) => {

    const { productId, newQuantity } = req.body;

    db.get(
        "SELECT * FROM products WHERE id = ?",
        [productId],
        (err, product) => {

            if (err || !product) {
                return res.status(404).json({
                    success: false
                });
            }

            const difference = newQuantity - product.quantity;
            const now = new Date().toLocaleString();

            db.run(
                "UPDATE products SET quantity = ? WHERE id = ?",
                [newQuantity, productId]
            );

            db.run(
                `INSERT INTO inventory
                (productId, productName, oldQuantity, newQuantity, difference, date)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    productId,
                    product.name,
                    product.quantity,
                    newQuantity,
                    difference,
                    now
                ]
            );

            res.json({
                success: true
            });

        }
    );

});
// Отчет по продажам
app.get("/api/report", (req, res) => {

    db.all(
        "SELECT * FROM sales ORDER BY id DESC",
        [],
        (err, rows) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(rows);

        });

});

app.listen(3000, "0.0.0.0", () => {
    console.log("CRM запущена");
});