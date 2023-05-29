"use strict";

async function addCart(id, quantity) {
  let res = await fetch("/products/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ id, quantity }),
  });

  let json = await res.json();
  document.querySelector("#cart-quantity").innerHTML = `(${json.quantity})`;
}

async function updateCart(id, quantity) {
  if (quantity > 0) {
    let res = await fetch("/products/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id, quantity }),
    });

    if (res.status == 200) {
      let json = await res.json();
      document.querySelector("#cart-quantity").innerText = `(${json.quantity})`;
      document.querySelector("#subtotal").innerText = `\$${json.subtotal}`;
      document.querySelector("#total").innerText = `\$${json.total}`;
      document.querySelector(
        `#product-${id}-total`
      ).innerText = `\$${json.item.total}`;
    }
  } else {
    removeCart(id);
  }
}

async function removeCart(id) {
  if (confirm("Do you really want to remove this product ?")) {
    let res = await fetch("/products/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (res.status == 200) {
      let json = await res.json();
      document.querySelector("#cart-quantity").innerText = `(${json.quantity})`;
      if (json.quantity > 0) {
        document.querySelector("#subtotal").innerText = `\$${json.subtotal}`;
        document.querySelector("#total").innerText = `\$${json.total}`;
        document.querySelector(`#product-${id}`).remove();
      } else {
        document.querySelector(
          ".cart-page .container"
        ).innerHTML = ` <div class="text-center border py-3">
                          <h3>Your cart is empty!</h3>
                        </div>`;
      }
    }
  }
}

async function clearCart() {
  if (confirm("Do you really want to remove all products ?")) {
    let res = await fetch("/products/cart/clear", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (res.status == 200) {
      document.querySelector("#cart-quantity").innerText = "(0)";

      document.querySelector(
        ".cart-page .container"
      ).innerHTML = `<div class="text-center border py-3">
                        <h3>Your cart is empty!</h3>
                      </div>`;
    }
  }
}
