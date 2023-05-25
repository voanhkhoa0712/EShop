const controller = {};

const models = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

controller.getData = async (req, res, next) => {
  // Get all categories with their belonged products
  const categories = await models.Category.findAll({
    include: [{ model: models.Product }],
  });
  res.locals.categories = categories;

  // Get all brands with their belonged products
  const brands = await models.Brand.findAll({
    include: [{ model: models.Product }],
  });
  res.locals.brands = brands;

  // Get all tags
  const tags = await models.Tag.findAll();
  res.locals.tags = tags;

  next();
};

controller.show = async (req, res) => {
  // Get query
  const selectedCategory = isNaN(req.query.category)
    ? 0
    : parseInt(req.query.category);
  const selectedBrand = isNaN(req.query.brand) ? 0 : parseInt(req.query.brand);
  const selectedTag = isNaN(req.query.tag) ? 0 : parseInt(req.query.tag);
  const searchKeyword = req.query.keyword || "";
  const sort = ["price", "newest", "popular"].includes(req.query.sort)
    ? req.query.sort
    : "price";

  // Default filter
  const productFilter = {
    attributes: ["id", "name", "imagePath", "stars", "price", "oldPrice"],
    where: {},
  };

  // Additional filter for query
  if (selectedCategory > 0) productFilter.where.categoryId = selectedCategory;
  if (selectedBrand > 0) productFilter.where.brandId = selectedBrand;
  if (selectedTag > 0)
    productFilter.include = [
      {
        model: models.Tag,
        where: { id: selectedTag },
      },
    ];
  if (searchKeyword.trim() != "") {
    productFilter.where.name = { [Op.iLike]: `%${searchKeyword}%` };
  }

  switch (sort) {
    case "newest":
      productFilter.order = [["createdAt", "DESC"]];
      break;
    case "popular":
      productFilter.order = [["stars", "DESC"]];
      break;
    default:
      productFilter.order = [["price", "ASC"]];
  }

  res.locals.sort = sort;
  res.locals.originalUrl = removeParam("sort", req.originalUrl);
  if (Object.keys(req.query).length == 0) {
    res.locals.originalUrl = res.locals.originalUrl + "?";
  }

  const products = await models.Product.findAll(productFilter);
  res.locals.products = products;

  res.render("product-list");
};

controller.showDetail = async (req, res) => {
  const id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
  const product = await models.Product.findOne({
    attributes: [
      "id",
      "name",
      "stars",
      "price",
      "oldPrice",
      "summary",
      "description",
      "specification",
    ],
    where: { id },
    include: [
      {
        model: models.Image,
        attributes: ["name", "imagePath"],
      },
      {
        model: models.Review,
        attributes: ["id", "review", "stars", "createdAt"],
        include: [
          {
            model: models.User,
            attributes: ["firstName", "lastName"],
          },
        ],
      },
      { model: models.Tag, attributes: ["id"] },
    ],
  });
  res.locals.product = product;

  const tagIds = [];
  product.Tags.forEach((tag) => tagIds.push(tag.id));

  const relatedProducts = await models.Product.findAll({
    attributes: ["id", "name", "imagePath", "price", "oldPrice"],
    include: [
      {
        model: models.Tag,
        attributes: ["id"],
        where: {
          id: { [Op.in]: tagIds },
        },
      },
    ],
  });
  res.locals.relatedProducts = relatedProducts;

  res.render("product-detail");
};

function removeParam(key, sourceURL) {
  var rtn = sourceURL.split("?")[0],
    param,
    params_arr = [],
    queryString = sourceURL.indexOf("?") !== -1 ? sourceURL.split("?")[1] : "";
  if (queryString !== "") {
    params_arr = queryString.split("&");
    for (var i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split("=")[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
    if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
  }
  return rtn;
}

module.exports = controller;
