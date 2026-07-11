const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended:true }));

app.use(express.static(path.join(__dirname,"public")));


app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"public","index.html"));
});


app.get("/api/test",(req,res)=>{
    res.json({
        success:true,
        message:"Сервер работает!"
    });
});



/*
============================
ТОВАРЫ
============================
*/


app.get("/api/products", async(req,res)=>{

try{


const result = await db.query(`
SELECT
id,
barcode,
name,
category,
buyprice AS "buyPrice",
sellprice AS "sellPrice",
quantity

FROM products

ORDER BY id DESC
`);


res.json(result.rows);



}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}

});





app.post("/api/products",async(req,res)=>{

try{


let {
barcode,
name,
category,
buyPrice,
sellPrice,
quantity
}=req.body;



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
buyprice,
sellprice,
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



}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}

});






app.put("/api/products/:id",async(req,res)=>{


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
buyprice=$4,
sellprice=$5,
quantity=$6

WHERE id=$7
`,
[
barcode,
name,
category,
Number(buyPrice)||0,
Number(sellPrice)||0,
Number(quantity)||0,
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





app.delete("/api/products/:id",async(req,res)=>{


try{


await db.query(
"DELETE FROM products WHERE id=$1",
[
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



/*
============================
ПРОДАЖИ
============================
*/


app.post("/api/sale",async(req,res)=>{

try{


const {
cart,
payment
}=req.body;



if(!Array.isArray(cart) || cart.length===0){

return res.status(400).json({
success:false,
message:"Корзина пустая"
});

}


for(const item of cart){


const product = await db.query(
`
SELECT *

FROM products

WHERE id=$1
`,
[
item.id
]
);



if(product.rows.length===0){

return res.status(404).json({
success:false,
message:"Товар не найден"
});

}



const dbProduct = product.rows[0];



if(Number(dbProduct.quantity)<=0){

return res.status(400).json({
success:false,
message:
dbProduct.name+" закончился"
});

}



await db.query(
`
INSERT INTO sales
(
productid,
productname,
quantity,
price,
payment,
date
)

VALUES($1,$2,$3,$4,$5,NOW())
`,
[
dbProduct.id,
dbProduct.name,
1,
Number(dbProduct.sellprice),
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
dbProduct.id
]
);



}



res.json({
success:true,
message:"Продажа проведена"
});



}catch(err){

console.error("SALE ERROR:",err);

res.status(500).json({
success:false,
message:err.message
});

}


});
/*
============================
ИСТОРИЯ ПРОДАЖ
============================
*/


app.get("/api/sales", async(req,res)=>{

try{


const result = await db.query(`
SELECT
id,
productid,
productname,
quantity,
price,
payment,
date

FROM sales

ORDER BY id DESC
`);


res.json(result.rows);



}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}

});





/*
============================
ОТЧЕТ ЗА ДЕНЬ
============================
*/


app.get("/api/report/today", async(req,res)=>{


try{


const result = await db.query(`

SELECT

COUNT(*) AS sales_count,
SUM(price * quantity) AS total

FROM sales

WHERE date::date = CURRENT_DATE

`);




res.json({

success:true,

sales:Number(result.rows[0].sales_count || 0),

total:Number(result.rows[0].total || 0)

});



}catch(err){

console.error(err);

res.status(500).json({
success:false
});

}


});





/*
============================
КАССА
============================
*/


app.get("/api/cash", async(req,res)=>{


try{


const result = await db.query(`

SELECT

payment,

SUM(price * quantity) AS total


FROM sales


WHERE date::date = CURRENT_DATE


GROUP BY payment


`);



let cash = 0;
let telegram = 0;



result.rows.forEach(row=>{


if(row.payment==="cash"){

cash = Number(row.total);

}


if(row.payment==="telegram"){

telegram = Number(row.total);

}


});




res.json({

success:true,

cash,

telegram,

total:cash+telegram

});




}catch(err){

console.error(err);


res.status(500).json({
success:false
});


}


});






/*
============================
ОБЩИЙ ОТЧЕТ
============================
*/


app.get("/api/report", async(req,res)=>{


try{


const result = await db.query(`

SELECT

DATE(date) AS day,

SUM(price * quantity) AS total


FROM sales


GROUP BY DATE(date)


ORDER BY day DESC


LIMIT 30


`);



res.json(result.rows);



}catch(err){


console.error(err);


res.status(500).json({
success:false
});


}


});





/*
============================
ЗАПУСК СЕРВЕРА
============================
*/


app.listen(PORT,()=>{


console.log("==============================");
console.log("✅ Maison Vape CRM запущена");
console.log("🌐 Порт:",PORT);
console.log("==============================");


});