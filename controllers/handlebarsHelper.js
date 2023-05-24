"use strict";

const helper = {};

helper.createStarList = (stars) => {
  let star = Math.floor(stars);
  let half = stars - star;
  let starList = '<div class="ratting">';

  let i;
  for (i = 0; i < star; i++) starList += '<i class="fa fa-star"></i>';

  if (half > 0) {
    starList += '<i class="fa fa-star-half"></i>';
    i++;
  }

  for (; i < 5; i++) starList += '<i class="fa fa-star-o"></i>';

  starList += "</div>";

  return starList;
};

module.exports = helper;
