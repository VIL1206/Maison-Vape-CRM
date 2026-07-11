const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Сервер работает!"
    });
});

/* ============================
   ТОВАРЫ
============================ */

// Получить все товары
app.get("/api/products", (req, res) => {

    db.all(
        "SELECT * FROM products ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Ошибка получения товаров"
                });
            }

            res.json(rows);

        }
    );

});

// Добавить товар
app.post("/api/products", (req, res) => {

    let {
        barcode,
        name,
        category,
        buyPrice,
        sellPrice,
        quantity
    } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: "Введите название товара"
        });
    }

    barcode = barcode || "";
    category = category || "";
    buyPrice = Number(buyPrice) || 0;
    sellPrice = Number(sellPrice) || 0;
    quantity = Number(quantity) || 0;

    db.run(
        `
        INSERT INTO products
        (
            barcode,
            name,
            category,
            buyPrice,
            sellPrice,
            quantity
        )
        VALUES(?,?,?,?,?,?)
        `,
        [
            barcode,
            name.trim(),
            category,
            buyPrice,
            sellPrice,
            quantity
        ],
        function (err) {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Ошибка добавления товара"
                });

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
        "DELETE FROM products WHERE id=?",
        [req.params.id],
        function (err) {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false
                });

            }

            res.json({
                success: true
            });

        }
    );

});

// Изменить товар
app.put("/api/products/:id", (req, res) => {

    let {
        barcode,
        name,
        category,
        buyPrice,
        sellPrice,
        quantity
    } = req.body;

    if (!name || !name.trim()) {

        return res.status(400).json({
            success: false,
            message: "Название обязательно"
        });

    }

    db.run(
        `
        UPDATE products
        SET
            barcode=?,
            name=?,
            category=?,
            buyPrice=?,
            sellPrice=?,
            quantity=?
        WHERE id=?
        `,
        [
            barcode,
            name.trim(),
            category,
            Number(buyPrice),
            Number(sellPrice),
            Number(quantity),
            req.params.id
        ],
        function (err) {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false
                });

            }

            res.json({
                success: true
            });

        }
    );

});

/* ============================
   ПРОДАЖИ
============================ */
// Продажа товаров
app.post("/api/sale", (req, res) => {

    const { cart, payment } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Корзина пустая"
        });
    }

    const now = new Date().toLocaleString("ru-RU");

    let completed = 0;
    let hasError = false;

    cart.forEach(product => {

        db.get(
            "SELECT quantity FROM products WHERE id=?",
            [product.id],
            (err, row) => {

                if (hasError) return;

                if (err || !row) {

                    hasError = true;

                    return res.status(500).json({
                        success: false,
                        message: "Товар не найден"
                    });

                }

                if (row.quantity <= 0) {

                    hasError = true;

                    return res.status(400).json({
                        success: false,
                        message: `${product.name} закончился`
                    });

                }

                db.run(
                    `INSERT INTO sales
                    (productId, productName, quantity, price, payment, date)
                    VALUES (?,?,?,?,?,?)`,
                    [
                        product.id,
                        product.name,
                        1,
                        product.sellPrice,
                        payment,
                        now
                    ],
                    function (err) {

                        if (err && !hasError) {

                            hasError = true;

                            return res.status(500).json({
                                success: false
                            });

                        }

                        db.run(
                            `UPDATE products
                             SET quantity = quantity - 1
                             WHERE id=?`,
                            [product.id],
                            function (err) {

                                if (err && !hasError) {

                                    hasError = true;

                                    return res.status(500).json({
                                        success: false
                                    });

                                }

                                completed++;

                                if (completed === cart.length && !hasError) {

                                    res.json({
                                        success: true
                                    });

                                }

                            }
                        );

                    }
                );

            }
        );

    });

});


// Получить кассу
app.get("/api/cash", (req, res) => {

    db.all(
        `
        SELECT payment,
               SUM(price) AS total
        FROM sales
        GROUP BY payment
        `,
        [],
        (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false
                });

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

    const now = new Date().toLocaleString("ru-RU");

    db.get(
        "SELECT * FROM products WHERE id=?",
        [productId],
        (err, product) => {

            if (err || !product) {

                return res.status(404).json({
                    success: false,
                    message: "Товар не найден"
                });

            }

            db.run(
                `
                UPDATE products
                SET quantity = quantity + ?
                WHERE id=?
                `,
                [
                    Number(quantity),
                    productId
                ],
                function (err) {

                    if (err) {

                        return res.status(500).json({
                            success: false
                        });

                    }

                    db.run(
                        `
                        INSERT INTO deliveries
                        (
                            productId,
                            productName,
                            quantity,
                            supplier,
                            date
                        )
                        VALUES (?,?,?,?,?)
                        `,
                        [
                            productId,
                            product.name,
                            Number(quantity),
                            supplier,
                            now
                        ],
                        function (err) {

                            if (err) {

                                return res.status(500).json({
                                    success: false
                                });

                            }

                            res.json({
                                success: true
                            });

                        }

                    );

                }

            );

        }

    );

});

/* ============================
   ПЕРЕУЧЕТ
============================ */
// Переучет товара
app.post("/api/inventory", (req, res) => {

    const { productId, newQuantity } = req.body;

    db.get(
        "SELECT * FROM products WHERE id=?",
        [productId],
        (err, product) => {

            if (err || !product) {

                return res.status(404).json({
                    success: false,
                    message: "Товар не найден"
                });

            }

            const difference =
                Number(newQuantity) - Number(product.quantity);

            const now = new Date().toLocaleString("ru-RU");

            db.run(
                `
                UPDATE products
                SET quantity=?
                WHERE id=?
                `,
                [
                    Number(newQuantity),
                    productId
                ],
                function (err) {

                    if (err) {

                        return res.status(500).json({
                            success: false
                        });

                    }

                    db.run(
                        `
                        INSERT INTO inventory
                        (
                            productId,
                            productName,
                            oldQuantity,
                            newQuantity,
                            difference,
                            date
                        )
                        VALUES (?,?,?,?,?,?)
                        `,
                        [
                            productId,
                            product.name,
                            product.quantity,
                            Number(newQuantity),
                            difference,
                            now
                        ],
                        function (err) {

                            if (err) {

                                return res.status(500).json({
                                    success: false
                                });

                            }

                            res.json({
                                success: true
                            });

                        }

                    );

                }

            );

        }

    );

});


// Отчет по продажам
app.get("/api/report", (req, res) => {

    db.all(
        `
        SELECT *
        FROM sales
        ORDER BY id DESC
        `,
        [],
        (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false
                });

            }

            res.json(rows);

        }

    );

});


// Закрытие смены
app.post("/api/close-shift", (req, res) => {

    db.all(
        `
        SELECT payment,
               SUM(price) AS total
        FROM sales
        GROUP BY payment
        `,
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false
                });

            }

            let cash = 0;
            let card = 0;
            let telegram = 0;

            rows.forEach(item => {

                if (item.payment === "Наличные")
                    cash = item.total || 0;

                if (item.payment === "Карта")
                    card = item.total || 0;

                if (item.payment === "Telegram")
                    telegram = item.total || 0;

            });

            const total =
                Number(cash) +
                Number(card) +
                Number(telegram);

            db.run(
                `
                INSERT INTO shift_reports
                (
                    cash,
                    card,
                    telegram,
                    total,
                    closedAt
                )
                VALUES (?,?,?,?,?)
                `,
                [
                    cash,
                    card,
                    telegram,
                    total,
                    new Date().toLocaleString("ru-RU")
                ],
                function (err) {

                    if (err) {

                        return res.status(500).json({
                            success: false
                        });

                    }

                    db.run(
                        "DELETE FROM sales",
                        [],
                        function (err) {

                            if (err) {

                                return res.status(500).json({
                                    success: false
                                });

                            }

                            res.json({
                                success: true
                            });

                        }
                    );

                }

            );

        }

    );

});


// История смен
app.get("/api/history", (req, res) => {

    db.all(
        `
        SELECT *
        FROM shift_reports
        ORDER BY id DESC
        `,
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false
                });

            }

            res.json(rows);

        }

    );

});


// Запуск сервера
app.listen(PORT, "0.0.0.0", () => {

    console.log("==================================");
    console.log("✅ Maison Vape CRM запущена");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("==================================");

});