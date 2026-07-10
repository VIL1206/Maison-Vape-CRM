async function loadProducts() {

    const response = await fetch("/api/products");
    const products = await response.json();

    let html = "";

    products.forEach(product => {

        html += `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>${product.sellPrice} грн</td>
            <td>

<button onclick="editProduct(${product.id})">
✏
</button>

<button onclick="deleteProduct(${product.id})">
🗑
</button>

</td>
        </tr>
        `;

    });

    document.getElementById("products").innerHTML = html;

}

async function addProduct() {

    const product = {

        barcode: document.getElementById("barcode").value,
        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        buyPrice: Number(document.getElementById("buyPrice").value),
        sellPrice: Number(document.getElementById("sellPrice").value),
        quantity: Number(document.getElementById("quantity").value)

    };

    await fetch("/api/products", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(product)

    });

    clearForm();

    loadProducts();

}

async function deleteProduct(id) {

    if (!confirm("Удалить товар?")) return;

    await fetch("/api/products/" + id, {
        method: "DELETE"
    });

    loadProducts();

}

function searchProducts() {

    const text = document
        .getElementById("search")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll("#products tr");

    rows.forEach(row => {

        row.style.display =
            row.innerText.toLowerCase().includes(text)
                ? ""
                : "none";

    });

}

function clearForm(){

    barcode.value="";
    name.value="";
    category.value="";
    buyPrice.value="";
    sellPrice.value="";
    quantity.value="";

}
async function editProduct(id){

    const response = await fetch("/api/products");

    const products = await response.json();

    const product = products.find(p=>p.id==id);

    const name = prompt("Название",product.name);

    if(name===null) return;

    const buyPrice = prompt("Закупка",product.buyPrice);

    const sellPrice = prompt("Продажа",product.sellPrice);

    const quantity = prompt("Количество",product.quantity);

    await fetch("/api/products/"+id,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            barcode:product.barcode,

            name,

            category:product.category,

            buyPrice,

            sellPrice,

            quantity

        })

    });

    loadProducts();

}
loadProducts();