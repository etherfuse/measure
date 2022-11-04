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
  Cell,
} from "recharts";
import { groupBy } from "../../utils";
import { Helmet } from "react-helmet-async";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "white", padding: "1rem" }}>
        <p className="label">
          {"Ip country: "}
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
          {"Ip Country: "}
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

function PoliticalCharts() {
  const [chartData, setChartData] = useState([]);
  const [chartCumulativeData, setCumulativeChartData] = useState([]);
  const [nakamotoCoefficient, setNakamotoCoefficient] = useState(0);

  useEffect(() => {
    axios
      .get("https://api.stakewiz.com/validators")
      .then((response) => {
        const dataGroupedByCity = groupBy(response.data, "ip_country");
        let dataArray = [];
        Object.keys(dataGroupedByCity).forEach((city) => {
          if (dataGroupedByCity[city][0].ip_country) {
            dataArray.push({
              ip_country: dataGroupedByCity[city][0].ip_country,
              count: dataGroupedByCity[city].length,
            });
          }
        });

        const sortedData = dataArray.sort((a, b) => {
          return a.count - b.count;
        });
        setChartData(sortedData);
        const total = sortedData.reduce((total, data) => total + data.count, 0);

        const cumulativeData = sortedData.map((data, index) => {
          if (index == 0) {
            data.cumulative = data.count;
          } else {
            data.cumulative = sortedData[index - 1].cumulative + data.count;
          }
          data.percentage = (data.count / total) * 100;
          data.cumulativePercentage = ((data.cumulative / total) * 100).toFixed(
            2
          );
          return data;
        });

        cumulativeData.reverse();
        let superminorityPercentage = 0;
        let nakamotoCoefficientCounter = 0;
        for (let index = 0; index < cumulativeData.length; index++) {
          const validator = cumulativeData[index];
          if (superminorityPercentage >= 67) {
            validator.superminority = "Decentralized";
          } else {
            validator.superminority = "Superminority";
            nakamotoCoefficientCounter++;
          }
          superminorityPercentage += validator.percentage;
        }
        setNakamotoCoefficient(nakamotoCoefficientCounter);
        setCumulativeChartData(cumulativeData.reverse());
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <Fragment>
      <Helmet>
        <title>Political - Etherfuse</title>
      </Helmet>
      <h1>Cumulative Influence of Solana’s Network</h1>
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
          data={chartCumulativeData}
          margin={{
            top: 100,
            right: 30,
            left: 20,
            bottom: 200,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="ip_country"
            angle={90}
            interval={0}
            height={30}
            dy={85}
            tick={{ fill: "white" }}
          />
          <YAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(tick) => `${tick}%`}
          >
            <Label
              angle={-90}
              value="Cumulative % of Validators"
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
              angle: 90,
              dy: -25,
            }}
          >
            {chartCumulativeData.map((entry, index) => (
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
      <h1>Political Influence of Solana’s Network</h1>
      <ResponsiveContainer
        width="100%"
        height="100%"
        className={"chart-cointainer"}
      >
        <BarChart
          width={500}
          height={300}
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 200,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="ip_country"
            angle={90}
            interval={0}
            height={30}
            dy={85}
            tick={{ fill: "white" }}
          />
          <YAxis>
            <Label
              angle={-90}
              value="Count per Country"
              position="insideLeft"
              style={{ textAnchor: "middle", fill: "white" }}
            />
          </YAxis>
          <Tooltip content={CustomTooltip} />
          <Bar
            dataKey="count"
            fill="#e4ff3f"
            label={{ position: "top", fill: "#FFFFFF" }}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
      <br />
    </Fragment>
  );
}

export default PoliticalCharts;
