let products = [];

async function loadProducts(){

    const response = await fetch("/api/products");

    products = await response.json();

    let html = "";

    products.forEach(product=>{

        html += `
        <option value="${product.id}">
            ${product.name}
        </option>
        `;

    });

    document.getElementById("product").innerHTML = html;

    showQuantity();

}

function showQuantity(){

    const id = Number(product.value);

    const item = products.find(p=>p.id===id);

    if(item){

        document.getElementById("current").innerHTML =
        "Остаток в базе: " + item.quantity;

    }

}

async function saveInventory(){

    await fetch("/api/inventory",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            productId:Number(product.value),

            newQuantity:Number(newQuantity.value)

        })

    });

    alert("Переучет сохранен!");

    loadProducts();

    newQuantity.value="";

}

loadProducts();