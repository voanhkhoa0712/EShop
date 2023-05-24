const controller = {};

const models = require("../models");

controller.show = async (req, res) => {
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

  // Get query
  const selectedCategory = isNaN(req.query.category)
    ? 0
    : parseInt(req.query.category);
  const selectedBrand = isNaN(req.query.brand) ? 0 : parseInt(req.query.brand);
  const selectedTag = isNaN(req.query.tag) ? 0 : parseInt(req.query.tag);

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

  const products = await models.Product.findAll(productFilter);
  res.locals.products = products;

  res.render("product-list");
};

module.exports = controller;
