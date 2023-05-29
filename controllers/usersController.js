"use strict";

const controller = {};
const models = require("../models");

controller.checkout = async (req, res) => {
  if (req.session.cart.quantity > 0) {
    const userId = 1;

    res.locals.addresses = await models.Address.findAll({ where: { userId } });

    res.locals.cart = req.session.cart.getCart();
    return res.render("checkout");
  } else {
    res.redirect("/products/cart");
  }
};

controller.placeorder = async (req, res) => {
  const userId = 1;
  const addressId = isNaN(req.body.addressId)
    ? 0
    : parseInt(req.body.addressId);
  let address = await models.Address.findByPk(addressId);

  // If not existed, Create new address
  if (!address) {
    address = await models.Address.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobile: req.body.mobile,
      address: req.body.address,
      country: req.body.country,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      isDefault: req.body.isDefault,
      userId,
    });
  }

  const cart = req.session.cart;
  cart.paymentMethod = req.body.payment;
  cart.shippingAddress = `${address.firstName} ${address.lastName}, 
                          Email: ${address.email}, Mobile: ${address.mobile}, 
                          Address: ${address.address}, ${address.city}, ${address.country}, 
                                    ${address.state}, ${address.zipCode}`;

  switch (req.body.payment) {
    case "PAYPAL":
      saveOrder(req, res, "PAID");
      break;
    case "COD":
      saveOrder(req, res, "UNPAID");
      break;
  }

  // return res.redirect("/users/checkout");
};

async function saveOrder(req, res, status) {
  const userId = 1;
  let { items, ...others } = req.session.cart.getCart();

  const order = await models.Order.create({ userId, ...others, status });

  const orderDetails = [];
  items.forEach((item) => {
    orderDetails.push({
      orderId: order.id,
      productId: item.product.id,
      price: item.product.price,
      quantity: item.quantity,
      total: item.total,
    });
  });

  await models.OrderDetail.bulkCreate(orderDetails);
  req.session.cart.clear();
  return res.render("message", { message: "Thank for your purchase" });
}

module.exports = controller;
