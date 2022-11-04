import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  Text,
  Cell,
} from "recharts";
import { groupBy } from "../../utils";
import { Helmet } from "react-helmet-async";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "white", padding: "1rem" }}>
        <p className="label">
          {"Country (group): "}
          <b>{label}</b>
        </p>
        <p className="label">
          {"Count of Ip Country: "}
          <b>{payload[0].value}</b>
        </p>
      </div>
    );
  }

  return null;
};

const CustomTooltipCumulative = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "white", padding: "1rem" }}>
        <p className="label">
          {"Country (group): "}
          <b>{label}</b>
        </p>
        <p className="label">
          {"Superminority: "}
          <b>{payload[0].payload.superminority}</b>
        </p>
      </div>
    );
  }

  return null;
};
const { lookUp } = require("geojson-places");
const continents = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North america",
  OC: "Oceania",
  SA: "South america",
};
function RegionalCharts() {
  const [regionalChartData, setRegionalChartData] = useState([]);
  const [regionalCumulativeChartData, setRegionalCumulativeChartData] =
    useState([]);
  const [nakamotoCoefficient, setNakamotoCoefficient] = useState(0);

  useEffect(() => {
    axios
      .get("https://api.stakewiz.com/validators")
      .then((response) => {
        const rawValidators = response.data;

        const validatorGroupedByCountry = groupBy(rawValidators, "ip_country");
        let reducedValidatorGroupedByCountry = [];
        Object.keys(validatorGroupedByCountry).forEach((country) => {
          if (
            validatorGroupedByCountry[country][0].ip_country &&
            validatorGroupedByCountry[country][0].ip_latitude &&
            validatorGroupedByCountry[country][0].ip_longitude
          ) {
            reducedValidatorGroupedByCountry.push({
              country: validatorGroupedByCountry[country][0].ip_country,
              ip_latitude: validatorGroupedByCountry[country][0].ip_latitude,
              ip_longitude: validatorGroupedByCountry[country][0].ip_longitude,
              count: validatorGroupedByCountry[country].length,
            });
          }
        });
        const validatorsWithContinent = reducedValidatorGroupedByCountry.map(
          (validator) => {
            validator.continent =
              continents[
                lookUp(
                  parseFloat(validator.ip_latitude),
                  parseFloat(validator.ip_longitude)
                )?.continent_code
              ];
            return validator;
          }
        );
        const validatorGroupedByContinent = groupBy(
          validatorsWithContinent,
          "continent"
        );
        let validatorArray = [];
        Object.keys(validatorGroupedByContinent).forEach((continent) => {
          validatorArray.push({
            continent: validatorGroupedByContinent[continent][0].continent,
            count: validatorGroupedByContinent[continent].reduce(
              (total, validator) => total + validator.count,
              0
            ),
          });
        });
        const sortedData = validatorArray.sort((a, b) => {
          return a.count - b.count;
        });
        setRegionalChartData(sortedData);
        const total = sortedData.reduce(
          (total, validator) => total + validator.count,
          0
        );

        const regionalCumulativeData = sortedData.map((validator, index) => {
          if (index == 0) {
            validator.cumulative = validator.count;
          } else {
            validator.cumulative =
              sortedData[index - 1].cumulative + validator.count;
          }
          validator.percentage = (validator.count / total) * 100;
          validator.cumulativePercentage = (
            (validator.cumulative / total) *
            100
          ).toFixed(2);
          return validator;
        });

        const reversedRegionalCumulativeData = regionalCumulativeData.reverse();
        let superminorityPercentage = 0;
        let nakamotoCoefficientCounter = 0;
        for (
          let index = 0;
          index < reversedRegionalCumulativeData.length;
          index++
        ) {
          const validator = reversedRegionalCumulativeData[index];
          if (superminorityPercentage >= 67) {
            validator.superminority = "Decentralized";
          } else {
            validator.superminority = "Superminority";
            nakamotoCoefficientCounter++;
          }
          superminorityPercentage += validator.percentage;
        }
        setNakamotoCoefficient(nakamotoCoefficientCounter);
        setRegionalCumulativeChartData(regionalCumulativeData.reverse());
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <Fragment>
      <Helmet>
        <title>Regional - Etherfuse</title>
      </Helmet>
      <h1>Cumulative Regional Influence of Solana’s Network</h1>
      <h5 style={{ textAlign: "center" }}>
        Nakamoto Coefficient ({nakamotoCoefficient})
      </h5>
      <ResponsiveContainer
        width="100%"
        height="100%"
        className={"chart-cointainer"}
      >
        <BarChart
          width={500}
          height={300}
          data={regionalCumulativeChartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 200,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="continent"
            angle={90}
            tick={{ fill: "white", textAnchor: "top" }}
          />
          <YAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(tick) => `${tick}%`}
          >
            <Label
              angle={-90}
              value="Cumulative % per Validators"
              position="insideLeft"
              style={{ textAnchor: "middle", fill: "white" }}
            />
          </YAxis>
          <Tooltip content={CustomTooltipCumulative} />
          <Bar
            dataKey="cumulativePercentage"
            isAnimationActive={false}
            label={{
              position: "top",
              fill: "white",
              formatter: (value) => `${value}%`,
            }}
          >
            {regionalCumulativeChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.superminority == "Superminority" ? "#9945FF" : "#14F195"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <h1>Regional Influence of Solana’s Network</h1>
      <ResponsiveContainer
        width="100%"
        height="100%"
        className={"chart-cointainer"}
      >
        <BarChart
          width={500}
          height={300}
          data={regionalChartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 200,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="continent"
            angle={90}
            tick={{ fill: "white", textAnchor: "top" }}
          />
          <YAxis>
            <Label
              angle={-90}
              value="Count per Region"
              position="insideLeft"
              style={{ textAnchor: "middle", fill: "white" }}
            />
          </YAxis>
          <Tooltip content={CustomTooltip} />
          <Bar
            dataKey="count"
            fill="#e4ff3f"
            isAnimationActive={false}
            label={{ position: "top", fill: "white" }}
          />
        </BarChart>
      </ResponsiveContainer>
      <br />
    </Fragment>
  );
}

export default RegionalCharts;
