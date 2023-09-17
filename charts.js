const QuickChart = require("quickchart-js");
const results = require("./nodeResults.json");

const OPTIONS = ["count", "max", "min", "average", "couponLife"];
const chartTiltes = {
  count: "Coupon count by type",
  max: "Heighest value vy coupon type",
  min: "Lowest value by coupon type",
  average: "Average value by coupon type",
  couponLife: "Average Coupon life (DAYS)",
};

const myChart = new QuickChart();
const chartDataType = process.argv.slice(2)[0];

if (!OPTIONS.includes(chartDataType)) console.log("wrong value");
else {
  const couponTypes = results["allTypes"];
  const dataSets = Object.keys(results)
    .map((store) => {
      if (store === "allTypes") return;
      const data = [];
      couponTypes.forEach((couponType) =>
        data.push(
          results[store][couponType]
            ? results[store][couponType][chartDataType]
            : 0
        )
      );
      return { label: store, data };
    })
    .filter((elem) => elem);

  console.log(dataSets);

  myChart.setConfig({
    type: "bar",
    data: {
      labels: results["allTypes"],
      datasets: dataSets,
    },
    options: {
      title: {
        display: true,
        text: chartTiltes[chartDataType],
      },
    },
  });
  require("openurl").open(myChart.getUrl());
}
