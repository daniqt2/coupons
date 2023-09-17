const fs = require("fs");
const sample = require("./coupons.json");
const moment = require("moment");

const typeCount = {};
const typeCountByStore = {};
const byStore = {};
const results = {};

const getMaxValue = (key, arr) => Math.max(...arr.map((o) => o[key]));
const getMinValue = (key, arr) => Math.min(...arr.map((o) => o[key]));
const getAverage = (arr) => arr.reduce((a, b) => a + b ?? 0) / arr.length;
const sortDates = (key, arr) =>
  arr.sort((a, b) => new Date(b[key]) - new Date(a[key]));

sample.coupons.forEach((coupon) => {
  let promotionType = coupon.promotion_type ?? "no-type";

  byStore[coupon.webshop_id] = byStore[coupon.webshop_id] || {};
  // sort into store arrays
  byStore[coupon.webshop_id][promotionType] =
    byStore[coupon.webshop_id][promotionType] || [];
  byStore[coupon.webshop_id][promotionType].push(coupon);
});
const types = [];
Object.keys(byStore).forEach((store) => {
  Object.keys(byStore[store]).forEach((type) => {
    if (!types.includes(type)) types.push(type);
    results[store] = results[store] || {};
    results[store][type] = results[store][type] || {};

    const arr = byStore[store][type];

    results[store][type]["count"] = arr.length;
    results[store][type]["max"] = getMaxValue("value", arr);
    results[store][type]["min"] = getMaxValue("value", arr);
    results[store][type]["average"] = getAverage(arr.map((c) => c.value));

    const sortedDates = sortDates("first_seen", arr);
    results[store][type]["oldest"] = sortedDates[arr.length - 1].first_seen;
    results[store][type]["newest"] = sortedDates[0].first_seen;
    results[store][type]["couponLife"] = getAverage(
      sortedDates.map((c) => moment(c.last_seen).diff(c.first_seen, "days"))
    ).toFixed(2);
  });
});

results["allTypes"] = types;

const jsonString = JSON.stringify(results);
fs.writeFile("./nodeResults.json", jsonString, (err) => {
  if (err) {
    console.log("Error writing file", err);
  } else {
    console.log("Successfully wrote file: nodeResults");
  }
});
