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


app.get("/api/products", async (req, res) => {

    try {

        const result = await db.query(
`
SELECT
id,
barcode,
name,
category,
buyPrice AS "buyPrice",
sellPrice AS "sellPrice",
quantity

FROM products
`
);

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success:false
        });

    }

});



app.post("/api/products", async (req,res)=>{

    try {

        let {
            barcode,
            name,
            category,
            buyPrice,
            sellPrice,
            quantity
        } = req.body;


        if(!name || !name.trim()){

            return res.status(400).json({
                success:false,
                message:"Введите название товара"
            });

        }


        const result = await db.query(
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
VALUES($1,$2,$3,$4,$5,$6)
RETURNING id
`,
[
barcode || "",
name.trim(),
category || "",
Number(buyPrice)||0,
Number(sellPrice)||0,
Number(quantity)||0
]
);


res.json({
    success:true,
    id:result.rows[0].id
});


    } catch(err){

        console.error(err);

        res.status(500).json({
            success:false
        });

    }


});



app.delete("/api/products/:id", async(req,res)=>{

try{

await db.query(
"DELETE FROM products WHERE id=$1",
[req.params.id]
);


res.json({
success:true
});


}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}

});



app.put("/api/products/:id", async(req,res)=>{

try{

const {
barcode,
name,
category,
buyPrice,
sellPrice,
quantity
}=req.body;


await db.query(
`
UPDATE products SET

barcode=$1,
name=$2,
category=$3,
buyPrice=$4,
sellPrice=$5,
quantity=$6

WHERE id=$7
`,
[
barcode,
name,
category,
Number(buyPrice),
Number(sellPrice),
Number(quantity),
req.params.id
]
);


res.json({
success:true
});


}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}

});
/* ============================
   ПРОДАЖИ
============================ */


app.post("/api/sale", async(req,res)=>{

try{

const {cart,payment}=req.body;


if(!Array.isArray(cart) || cart.length===0){

return res.status(400).json({
success:false,
message:"Корзина пустая"
});

}


for(const product of cart){


const check = await db.query(
"SELECT quantity FROM products WHERE id=$1",
[product.id]
);


if(check.rows.length===0){

return res.status(404).json({
success:false,
message:"Товар не найден"
});

}


if(check.rows[0].quantity<=0){

return res.status(400).json({
success:false,
message:`${product.name} закончился`
});

}



await db.query(
`
INSERT INTO sales
(
[
product.id,
product.productName || product.name,
1,
product.sellPrice,
payment
]
)
VALUES($1,$2,$3,$4,$5,NOW())
`,
[
product.id,
product.name,
1,
product.sellPrice,
payment
]
);



await db.query(
`
UPDATE products
SET quantity = quantity - 1
WHERE id=$1
`,
[
product.id
]
);



}


res.json({
success:true
});


}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}


});





// Получить кассу

app.get("/api/cash", async(req,res)=>{


try{


const result = await db.query(
`
SELECT 
payment,
SUM(price) AS total

FROM sales

GROUP BY payment
`
);


res.json(result.rows);



}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}


});





// Отчет продаж

app.get("/api/report", async(req,res)=>{


try{


const result = await db.query(
`
SELECT *

FROM sales

ORDER BY id DESC
`
);


res.json(result.rows);



}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}


});
/* ============================
   ПРИЕМ ТОВАРА
============================ */


app.post("/api/delivery", async(req,res)=>{

try{


const {
productId,
quantity,
supplier
}=req.body;



const product = await db.query(
"SELECT * FROM products WHERE id=$1",
[productId]
);



if(product.rows.length===0){

return res.status(404).json({
success:false,
message:"Товар не найден"
});

}



await db.query(
`
UPDATE products

SET quantity = quantity + $1

WHERE id=$2
`,
[
Number(quantity),
productId
]
);



await db.query(
`
INSERT INTO deliveries
(
productId,
productName,
quantity,
supplier,
date
)

VALUES($1,$2,$3,$4,NOW())
`,
[
productId,
product.rows[0].name,
Number(quantity),
supplier
]
);



res.json({
success:true
});



}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}

});





/* ============================
   ПЕРЕУЧЕТ
============================ */


app.post("/api/inventory", async(req,res)=>{


try{


const {
productId,
newQuantity
}=req.body;



const product = await db.query(
"SELECT * FROM products WHERE id=$1",
[productId]
);



if(product.rows.length===0){

return res.status(404).json({
success:false
});

}



const oldQuantity = product.rows[0].quantity;

const difference =
Number(newQuantity)-Number(oldQuantity);



await db.query(
`
UPDATE products

SET quantity=$1

WHERE id=$2
`,
[
Number(newQuantity),
productId
]
);



await db.query(
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

VALUES($1,$2,$3,$4,$5,NOW())
`,
[
productId,
product.rows[0].name,
oldQuantity,
Number(newQuantity),
difference
]
);



res.json({
success:true
});



}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}


});





/* ============================
   ЗАКРЫТИЕ СМЕНЫ
============================ */


app.post("/api/close-shift", async(req,res)=>{


try{


const result = await db.query(
`
SELECT
payment,
SUM(price) AS total

FROM sales

GROUP BY payment
`
);



let cash=0;
let card=0;
let telegram=0;



result.rows.forEach(item=>{


if(item.payment==="Наличные")
cash=Number(item.total);


if(item.payment==="Карта")
card=Number(item.total);


if(item.payment==="Telegram")
telegram=Number(item.total);


});



const total =
cash+
card+
telegram;



await db.query(
`
INSERT INTO shift_reports
(
cash,
card,
telegram,
total,
closedAt
)

VALUES($1,$2,$3,$4,NOW())
`,
[
cash,
card,
telegram,
total
]
);



await db.query(
"DELETE FROM sales"
);



res.json({
success:true
});



}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}

});





/* ============================
   ИСТОРИЯ СМЕН
============================ */


app.get("/api/history", async(req,res)=>{


try{


const result = await db.query(
`
SELECT *

FROM shift_reports

ORDER BY id DESC
`
);


res.json(result.rows);



}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}

});





// Запуск сервера

app.listen(PORT,"0.0.0.0",()=>{


console.log("==============================");
console.log("✅ Maison Vape CRM запущена");
console.log(`🌐 http://localhost:${PORT}`);
console.log("==============================");


});