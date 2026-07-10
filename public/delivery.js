async function loadProducts(){

    const response = await fetch("/api/products");

    const products = await response.json();

    let html="";

    products.forEach(product=>{

        html+=`
        <option value="${product.id}">
        ${product.name}
        </option>
        `;

    });

    document.getElementById("product").innerHTML=html;

}

async function acceptDelivery(){

    await fetch("/api/delivery",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            productId:Number(product.value),

            quantity:Number(quantity.value),

            supplier:supplier.value

        })

    });

    alert("Товар успешно принят!");

    quantity.value="";
    supplier.value="";

}

loadProducts();