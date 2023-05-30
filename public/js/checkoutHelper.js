"use strict";

function placeorder(e) {
  e.preventDefault();

  const addressId = document.querySelector("input[name=addressId]:checked");
  if (!addressId || !(addressId.value == 0)) {
    if (e.target.checkValidity()) {
      return e.target.reportValidity();
    }
  }

  e.target.submit();
}
