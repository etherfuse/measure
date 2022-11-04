import axios from "axios";
import { Fragment, useEffect, useRef, useState } from "react";
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
import { Helmet } from "react-helmet-async";

const CustomTooltipCumulative = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "white", padding: "1rem" }}>
        <p className="label">
          {"Name: "}
          <b>{payload[0].payload.name}</b>
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

function OwnershipsCharts() {
  const [ownershipChartData, setOwnershipChartData] = useState([]);
  const [ownershipCumulativeChartData, setOwnershiCumulativepChartData] =
    useState([]);
  const [nakamotoCoefficient, setNakamotoCoefficient] = useState(0);

  useEffect(() => {
    axios
      .get("https://api.stakewiz.com/validators")
      .then((response) => {
        const sortedData = response.data.sort((a, b) => {
          return a.stake_weight - b.stake_weight;
        });

        sortedData.reverse();
        let superminorityPercentage = 0;
        let nakamotoCoefficientCounter = 0;
        for (let index = 0; index < sortedData.length; index++) {
          const validator = sortedData[index];
          if (superminorityPercentage >= 35.5) {
            validator.superminority = "Descentralized";
          } else {
            validator.superminority = "Superminority";
            nakamotoCoefficientCounter++;
          }
          superminorityPercentage += validator.stake_weight;
        }
        setOwnershipChartData(sortedData.reverse());
        setOwnershiCumulativepChartData(
          sortedData.map((data) => data).reverse()
        );
        setNakamotoCoefficient(nakamotoCoefficientCounter);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <Fragment>
      <Helmet>
        <title>Ownership - Etherfuse</title>
      </Helmet>
      <h1>Cumulative Ownership Influence of Solana's Network</h1>
      <h5 style={{ textAlign: "center" }}>
        Nakamoto Coefficient ({nakamotoCoefficient})
      </h5>
      <ResponsiveContainer
        width="100%"
        minHeight={1000}
        className={"chart-cointainer"}
      >
        <BarChart
          height={1000}
          data={ownershipChartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 450,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="identity"
            angle={90}
            interval={50}
            height={30}
            tick={{ fill: "white", textAnchor: "top" }}
          />
          <YAxis type="number" tickFormatter={(tick) => `${tick}%`}>
            <Label
              angle={-90}
              value="Cumulative Stake Weight% of All Validators"
              position="insideLeft"
              style={{ textAnchor: "middle", fill: "white" }}
            />
          </YAxis>
          <Tooltip content={CustomTooltipCumulative} />
          <Bar dataKey="stake_weight" isAnimationActive={false}>
            {ownershipChartData.map((entry, index) => (
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
      <h1>Descending Cumulative Ownership Influence of Solana’s Network</h1>
      <h5 style={{ textAlign: "center" }}>
        Nakamoto Coefficient ({nakamotoCoefficient})
      </h5>
      <div
        className={"chart-cointainer"}
        style={{
          width: "100%",
          height: 1200,
          overflowX: "scroll",
          overflowY: "hidden",
        }}
      >
        <BarChart
          width={50000}
          height={1200}
          data={ownershipCumulativeChartData}
          margin={{
            top: 50,
            right: 30,
            left: 20,
            bottom: 450,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="identity"
            angle={90}
            interval={0}
            height={30}
            tick={{ fill: "white", textAnchor: "top" }}
          />
          <YAxis type="number" tickFormatter={(tick) => `${tick}%`}>
            <Label
              angle={-90}
              value="Descending Cumulative Stake Weight% of All Validators"
              position="insideLeft"
              style={{ textAnchor: "middle", fill: "white" }}
            />
          </YAxis>
          <Tooltip content={CustomTooltipCumulative} />
          <Bar
            dataKey="stake_weight"
            isAnimationActive={false}
            label={{
              position: "top",
              fill: "white",
              formatter: (value) => `${value}%`,
              angle: 90,
              dy: -25,
            }}
          >
            {ownershipCumulativeChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.superminority == "Superminority" ? "#9945FF" : "#14F195"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </div>
      <br />
    </Fragment>
  );
}

export default OwnershipsCharts;
