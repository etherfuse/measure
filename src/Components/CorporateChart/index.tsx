import axios from 'axios';
import { Fragment, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell } from 'recharts';
import { groupBy } from '../../utils';
import { Helmet } from "react-helmet-async";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'white', padding: '1rem' }}>
                <p className="label">{'Ip org: '}<b>{label}</b></p>
                <p className="label">{'Count of Ip org: '}<b>{payload[0].value}</b></p>
            </div>
        );
    }

    return null;
};

const CustomTooltipCumulative = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'white', padding: '1rem' }}>
                <p className="label">{'Ip org: '}<b>{label}</b></p>
                <p className="label">{'Superminority: '}<b>{payload[0].payload.superminority}</b></p>
            </div>
        );
    }

    return null;
};

const CustomTooltipAsn = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'white', padding: '1rem' }}>
                <p className="label">{'Ip Asn: '}<b>{label}</b></p>
                <p className="label">{'Count of Ip Asn: '}<b>{payload[0].value}</b></p>
            </div>
        );
    }

    return null;
};

const CustomTooltipCumulativeAsn = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'white', padding: '1rem' }}>
                <p className="label">{'Ip Asn: '}<b>{label}</b></p>
                <p className="label">{'Superminority: '}<b>{payload[0].payload.superminority}</b></p>
            </div>
        );
    }

    return null;
};

function CorporateCharts() {
    const [corporateChartData, setCorporateChartData] = useState([]);
    const [corporateChartCumulativeData, setCorporateCumulativeChartData] = useState([]);
    const [orgNakamotoCoefficient, setOrgNakamotoCoefficient] = useState(0);

    const [asnChartData, setAsnChartData] = useState([]);
    const [asnChartCumulativeData, setAsnCumulativeChartData] = useState([]);
    const [asnNakamotoCoefficient, setAsnNakamotoCoefficient] = useState(0);

    useEffect(() => {
        axios.get('https://api.stakewiz.com/validators')
            .then((response) => {
                const dataGroupedByOrg = groupBy(response.data, 'ip_org');
                let orgDataArray = [];
                Object.keys(dataGroupedByOrg).forEach((ip_org) => {
                    if (
                        dataGroupedByOrg[ip_org][0].ip_org
                    ) {
                        orgDataArray.push({
                            ip_org: dataGroupedByOrg[ip_org][0].ip_org,
                            count: dataGroupedByOrg[ip_org].length,
                        })
                    }
                });

                const orgSortedData = orgDataArray.sort((a, b) => {
                    return a.count - b.count;
                });
                setCorporateChartData(orgSortedData);
                const orgTotal = orgSortedData.reduce((total, data) => total + data.count, 0);
                const orgCumulativeData = orgSortedData.map((data, index) => {
                    if (index == 0) {
                        data.cumulative = data.count;
                    } else {
                        data.cumulative = orgSortedData[index - 1].cumulative + data.count;
                    }
                    data.percentage = ((data.count / orgTotal) * 100);
                    data.cumulativePercentage = ((data.cumulative / orgTotal) * 100).toFixed(2);
                    return data;
                });

                orgCumulativeData.reverse();
                let orgSuperminorityPercentage = 0;
                let orgNakamotoCoefficientCounter = 0;
                for (let index = 0; index < orgCumulativeData.length; index++) {
                    const validator = orgCumulativeData[index];
                    if (orgSuperminorityPercentage >= 67) {
                        validator.superminority = 'Decentralized';
                    } else {
                        validator.superminority = 'Superminority';
                        orgNakamotoCoefficientCounter++;
                    }
                    orgSuperminorityPercentage += validator.percentage;
                }
                setOrgNakamotoCoefficient(orgNakamotoCoefficientCounter);
                setCorporateCumulativeChartData(orgCumulativeData.reverse());

                const dataGroupedByAsn = groupBy(response.data, 'asn');
                let asnDataArray = [];
                Object.keys(dataGroupedByAsn).forEach((asn) => {
                    if (
                        dataGroupedByAsn[asn][0].asn
                    ) {
                        asnDataArray.push({
                            asn: dataGroupedByAsn[asn][0].asn,
                            count: dataGroupedByAsn[asn].length,
                        })
                    }
                });
                const asnSortedData = asnDataArray.sort((a, b) => {
                    return a.count - b.count;
                });
                setAsnChartData(asnSortedData);

                const asnTotal = asnSortedData.reduce((total, data) => total + data.count, 0);
                const asnCumulativeData = asnSortedData.map((data, index) => {
                    if (index == 0) {
                        data.cumulative = data.count;
                    } else {
                        data.cumulative = asnSortedData[index - 1].cumulative + data.count;
                    }
                    data.percentage = ((data.count / asnTotal) * 100);
                    data.cumulativePercentage = ((data.cumulative / asnTotal) * 100).toFixed(2);
                    return data;
                });

                asnCumulativeData.reverse();
                let asnSuperminorityPercentage = 0;
                let asnNakamotoCoefficientCounter = 0;
                for (let index = 0; index < asnCumulativeData.length; index++) {
                    const validator = asnCumulativeData[index];
                    if (asnSuperminorityPercentage >= 67) {
                        validator.superminority = 'Decentralized';
                    } else {
                        validator.superminority = 'Superminority';
                        asnNakamotoCoefficientCounter++;
                    }
                    asnSuperminorityPercentage += validator.percentage;
                }
                setAsnCumulativeChartData(asnCumulativeData.reverse());
                setAsnNakamotoCoefficient(asnNakamotoCoefficientCounter);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <Fragment><h1>Cumulative Corporate Influence of Solana’s Network</h1>
            <Helmet>
                <title>Corporate - Etherfuse</title>
            </Helmet>
            <h5 style={{ textAlign: 'center' }}>Nakamoto Coefficient ({orgNakamotoCoefficient})</h5>
            <ResponsiveContainer width="100%" height="100%" className={'chart-cointainer'}>
                <BarChart
                    width={500}
                    height={300}
                    data={corporateChartCumulativeData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 300,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ip_org" angle={90} interval={4} height={30} tick={{ fill: 'white', textAnchor: 'top' }} />
                    <YAxis type='number' domain={[0, 100]} tickFormatter={tick => `${tick}%`}>
                        <Label angle={-90} value='Cumulative % per Validators' position='insideLeft' style={{ textAnchor: 'middle', fill: 'white' }} />
                    </YAxis>
                    <Tooltip content={CustomTooltipCumulative} />
                    <Bar dataKey="cumulativePercentage" isAnimationActive={false} >
                        {
                            corporateChartCumulativeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.superminority == 'Superminority' ? '#9945FF' : '#14F195'} />
                            ))
                        }
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <br />
            <h5 style={{ textAlign: 'center' }}>Nakamoto Coefficient ({asnNakamotoCoefficient})</h5>
            <ResponsiveContainer width="100%" height="100%" className={'chart-cointainer'}>
                <BarChart
                    width={500}
                    height={300}
                    data={asnChartCumulativeData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 200,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="asn" angle={90} interval={4} height={30} tick={{ fill: 'white', textAnchor: 'top' }} />
                    <YAxis type='number' domain={[0, 100]} tickFormatter={tick => `${tick}%`}>
                        <Label angle={-90} value='Cumulative % per Validators' position='insideLeft' style={{ textAnchor: 'middle', fill: 'white' }} />
                    </YAxis>
                    <Tooltip content={CustomTooltipCumulativeAsn} />
                    <Bar dataKey="cumulativePercentage" isAnimationActive={false} >
                        {
                            asnChartCumulativeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.superminority == 'Superminority' ? '#9945FF' : '#14F195'} />
                            ))
                        }
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <h1>Corporate Influence of Solana’s Network</h1>
            <ResponsiveContainer width="100%" height="100%" className={'chart-cointainer'}>
                <BarChart
                    width={500}
                    height={300}
                    data={corporateChartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 300,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ip_org" angle={90} interval={5} tick={{ fill: 'white', textAnchor: 'top' }} />
                    <YAxis>
                        <Label angle={-90} value='Count per IP' position='insideLeft' style={{ textAnchor: 'middle', fill: 'white' }} />
                    </YAxis>
                    <Tooltip content={CustomTooltip} />
                    <Bar dataKey="count" fill="#e4ff3f" isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
            <br />
            <ResponsiveContainer width="100%" height="100%" className={'chart-cointainer'}>
                <BarChart
                    width={500}
                    height={300}
                    data={asnChartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 200,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="asn" angle={90} interval={5} tick={{ fill: 'white', textAnchor: 'top' }} />
                    <YAxis>
                        <Label angle={-90} value='Count per IP' position='insideLeft' style={{ textAnchor: 'middle', fill: 'white' }} />
                    </YAxis>
                    <Tooltip content={CustomTooltipAsn} />
                    <Bar dataKey="count" fill="#e4ff3f" isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
            <br />
        </Fragment >
    );
}

export default CorporateCharts;
