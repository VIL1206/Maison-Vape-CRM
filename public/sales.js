let products = [];
let cart = [];

async function loadProducts(){

    const response = await fetch("/api/products");

    products = await response.json();

    drawProducts(products);

}

function drawProducts(array){

    let html = "";

    array.forEach(product=>{

        html += `
        <tr>

        <td>${product.name}</td>

        <td>${product.sellPrice} грн</td>

        <td>${product.quantity}</td>

        <td>

        <button onclick="addToCart(${product.id})">

        +

        </button>

        </td>

        </tr>
        `;

    });

    list.innerHTML = html;

}

function searchProduct(){

    const text = search.value.toLowerCase();

    drawProducts(

        products.filter(p=>

            p.name.toLowerCase().includes(text)

        )

    );

}

function addToCart(id){

    const product = products.find(p=>p.id==id);

    cart.push(product);

    drawCart();

}

function drawCart(){

    let html = "";

    let total = 0;

    cart.forEach(product=>{

        html += `
        <tr>

        <td>${product.name}</td>

        <td>${product.sellPrice} грн</td>

        </tr>
        `;

        total += Number(product.sellPrice);

    });

    document.getElementById("cart").innerHTML = html;

    document.getElementById("total").innerHTML =
    "Итого: " + total + " грн";

}

async function checkout(){

    if(cart.length===0){

        alert("Корзина пустая");

        return;

    }

    const payment = prompt(
`Способ оплаты:

1 - Наличные
2 - Карта
3 - Telegram`
    );

    let type = "Наличные";

    if(payment=="2") type="Карта";

    if(payment=="3") type="Telegram";

    await fetch("/api/sale",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            cart,
            payment:type

        })

    });

    alert("Продажа успешно выполнена!");

    cart=[];

    drawCart();

    loadProducts();

}

loadProducts();