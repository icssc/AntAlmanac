import React, { PureComponent } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import quarterDayRanges from './static/quarter_day_ranges';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ENROLLMENT_DATA_ENDPOINT } from '../../api/endpoints';

const timeFormatter = (unixTime) => {
    return moment(unixTime).format('MM/DD/YY');
};

class CustomTooltip extends PureComponent {
    render() {
        const { active, payload, label } = this.props;
        if (active && payload !== null) {
            return (
                <div className="">
                    <p>Enrollment on {timeFormatter(label)}</p>
                    <p>Max Capacity: {payload[0].value}</p>
                    <p>Enrollment: {payload[1].value}</p>
                    <p>Waitlist: {payload[2] === undefined ? 'N/A' : payload[2].value}</p>
                </div>
            );
        }
        return null;
    }
}

class Graph extends PureComponent {
    start = new Date(quarterDayRanges[this.props.pastTerm].start);
    end = new Date(quarterDayRanges[this.props.pastTerm].end);

    state = {
        graphData: null,
    };

    componentDidMount = async () => {
        this.setState({ graphData: await this.fetchGraphData() });
    };

    fetchGraphData = async () => {
        const data = await fetch(ENROLLMENT_DATA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sectionCode: this.props.pastSectionCode, pastTerm: this.props.pastTerm }),
        });

        const jsonData = await data.json();

        return jsonData.data
            .filter((dataPoint) => {
                const dataDate = new Date(dataPoint.date);
                return dataDate >= this.start && dataDate <= this.end;
            })
            .map((dataPoint) => {
                return {
                    date: new Date(dataPoint.date).getTime(),
                    maxCapacity: parseInt(dataPoint.maxCapacity),
                    numCurrentlyEnrolled: parseInt(dataPoint.numCurrentlyEnrolled),
                    numOnWaitlist: isNaN(parseInt(dataPoint.numOnWaitlist)) ? null : parseInt(dataPoint.numOnWaitlist),
                    numRequested: parseInt(dataPoint.numRequested),
                };
            });
    };

    render() {
        return (
            <ResponsiveContainer width={'80%'} height={400}>
                <LineChart data={this.state.graphData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <XAxis domain={['auto', 'auto']} dataKey="date" tickFormatter={timeFormatter} type="number" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="maxCapacity" stroke="#8884d8" />
                    <Line type="monotone" dataKey="numCurrentlyEnrolled" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="numOnWaitlist" stroke="#ffc658" />
                    {/*<Line type="monotone" dataKey="numRequested" stroke="#82ca9d" />*/}
                </LineChart>
            </ResponsiveContainer>
        );
    }
}

Graph.propTypes = {
    pastSectionCode: PropTypes.string.isRequired,
    pastTerm: PropTypes.string.isRequired,
};

export default Graph;
