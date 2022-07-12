import React, { PureComponent } from 'react';
import { XAxis, YAxis, CartesianGrid, AreaChart, Area, Legend, Label, Tooltip, ReferenceLine } from 'recharts';
import querystring from 'querystring';

const CustomToolTipNum = ({ active, payload, label }) => {
    var max = '';
    var enroll = '';
    var waitlist = '';
    var lable = label;
    var style;
    var waitList = true;
    try {
        if (label.substring(0, 4) === 'Full') {
            lable = payload[0].payload.day;
        } else if (label.substring(0, 4) === 'Open') {
            lable = payload[0].payload.day;
        }
        max = String(payload[1].value);
        enroll = String(payload[2].value);
        waitlist = String(payload[0].value[0] - payload[0].value[1]);

        if (payload[1].value <= payload[2].value) {
            style = {
                color: 'red',
                opacity: '.8',
            };
        } else {
            style = {
                color: 'blue',
                opacity: '.8',
            };
        }
    } catch (err) {
        waitList = false;
        if (label.substring(0, 4) === 'Full') {
            lable = payload[0].payload.day;
        } else if (label.substring(0, 4) === 'Open') {
            lable = payload[0].payload.day;
        }
        max = String(payload[0].value);
        enroll = String(payload[1].value);

        if (payload[0].value <= payload[1].value) {
            style = {
                color: 'red',
                opacity: '.8',
            };
        } else {
            style = {
                color: 'blue',
                opacity: '.8',
            };
        }
    }
    if (waitlist === 'NaN') {
        waitList = false;
    }

    if (active) {
        if (waitList) {
            return (
                <div className="custom-tooltip" style={{ border: '1px solid black', background: '#F4F4F4' }}>
                    <p className="label">{lable}</p>
                    <p>
                        Max: <span style={{ color: 'red', opacity: '.8' }}>{`${max}`}</span>
                    </p>
                    <p>
                        Enrolled: <span style={style}>{`${enroll}`}</span>
                    </p>
                    <p>
                        Waitlist: <span style={{ color: '#BBBB00' }}> {`${waitlist}`}</span>
                    </p>
                </div>
            );
        } else {
            return (
                <div className="custom-tooltip" style={{ border: '1px solid black', background: '#F4F4F4' }}>
                    <p className="label">{lable}</p>
                    <p>
                        Max: <span style={{ color: 'red', opacity: '.8' }}>{`${max}`}</span>
                    </p>
                    <p>
                        Enrolled: <span style={style}>{`${enroll}`}</span>
                    </p>
                </div>
            );
        }
    }

    return null;
};

export default class OldGraph extends PureComponent {
    state = {
        enrolledColor: '#8884d8',
        reqColor: '#82ca9d',
        waitColor: '#fad700',
        maxColor: '#ff0000',
        wait: true,
        enrolled: true,
        max: true,
        req: false,
        data: {},
    };

    async componentDidMount() {
        try {
            this.fetchCourseData(this.props.courseID, this.props.session);
        } catch (err) {
            console.log(err);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.rawData !== prevProps.rawData) {
            this.formatData(this.props.rawData);
        }
    }

    fetchCourseData = async (courseID, session) => {
        //Get the course Data
        const params = {
            id: courseID,
            tableName: session,
        };
        const url =
            'https://cors-anywhere.herokuapp.com/https://8518jpadna.execute-api.us-west-1.amazonaws.com/prod/courseid?' +
            querystring.stringify(params);
        fetch(url.toString())
            .then((resp) => resp.json())
            .then((json) => {
                //console.log(url)
                try {
                    this.formatData(json);
                } catch (err) {
                    this.setState({
                        noData: true,
                    });
                }
            });
    };

    noSlash(ssv) {
        /*
    Values come in as slash seperated values, returns as array
    */
        return ssv.substring(1, ssv.length).split('/');
    }

    formatData(dataJason) {
        //console.log(dataJason)
        var date1 = dataJason.Item.DateInfo;
        //no idea why this line is needed but if this line is taken out
        //the first call of the function results in an undefined
        var date = this.noSlash(date1);
        //convert the rest of the courseData
        var enroll = this.noSlash(dataJason.Item.EnrollmentInfo);
        var max = this.noSlash(dataJason.Item.MaxInfo);
        var req = this.noSlash(dataJason.Item.RequestedInfo);
        var wait = this.noSlash(dataJason.Item.WaitlistInfo);

        var formatedData = [];
        for (var i = 0; i < date.length; i++) {
            //put courseData into format that rechart can read
            formatedData.push({
                name: date[i],
                waitlist: wait[i],
                max: max[i],
                enrolled: enroll[i],
                requested: req[i],
            });
        }
        this.setState({
            data: formatedData,
        });
        //console.log(this.state.courseData);
    }

    handleOnClick(o) {
        //handle people clicking on what to view
        if (o.id === 'waitlist') {
            this.setState({
                wait: !this.state.wait,
            });
        }
        if (o.id === 'enrolled') {
            this.setState({
                enrolled: !this.state.enrolled,
            });
        }
        if (o.id === 'maxenroll') {
            this.setState({
                max: !this.state.max,
            });
        }
        if (o.id === 'requested') {
            this.setState({
                req: !this.state.req,
            });
        }
    }

    render() {
        return (
            <AreaChart
                width={950}
                height={500}
                data={this.state.data}
                margin={{ top: 25, right: 30, left: 70, bottom: 5 }}
            >
                <defs>
                    <linearGradient id="colorenrolled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.0} />
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorwait" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#edd209" stopOpacity={0.0} />
                        <stop offset="100%" stopColor="#edd209" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="full" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d31027" stopOpacity={0.0} />
                        <stop offset="95%" stopColor="#d31027" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="black" fillOpacity={1} />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                {/*<Legend iconSize={35} iconType='circle' margin={ {top: 200,  right: 20 }}/>*/}

                {/**  <ReferenceLine y={this.props.rawData.max} label="max" stroke="red" alwaysShow/> */}
                <Area
                    name=" Waitlist"
                    type="monotone"
                    dataKey={this.state.wait ? 'waitlist' : ''}
                    stroke={this.state.waitColor}
                    fillOpacity={1}
                    fill="url(#colorwait)"
                />
                <Area
                    name=" Max Enrollment"
                    type="monotone"
                    dataKey={this.state.max ? 'max' : ''}
                    stroke="red"
                    fillOpacity={0}
                />
                <Area
                    name="Enrolled"
                    type="monotone"
                    dataKey={this.state.enrolled ? 'enrolled' : ''}
                    stroke={this.state.enrolledColor}
                    fillOpacity={1}
                    fill="url(#colorenrolled)"
                    strokeWidth={2}
                />
                {/*<Area type="monotone" dataKey="requisted"      stroke={this.state.reqColor}      activeDot={{ stroke: '#82ca9d', strokeWidth: 4, r: 7 }}/>*/}
                {/*<Area type="linearClosed" dataKey="waitlist" stroke={this.state.waitColor}     activeDot={{ stroke: '#fad700', strokeWidth: 4, r: 7 }}/>*/}
                <Area
                    name=" Requested"
                    type="monotone"
                    dataKey={this.state.req ? 'requested' : ''}
                    stroke={this.state.reqColor}
                    fillOpacity={0}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    onClick={this.handleOnClick}
                    payload={[
                        {
                            id: 'maxenroll',
                            value: 'Max Enrollment',
                            type: 'line',
                            color: `${this.state.max ? this.state.maxColor : '#FFFFFF'}`,
                            iconSize: '30',
                        },
                        {
                            id: 'enrolled',
                            value: 'Enrolled',
                            type: 'line',
                            color: `${this.state.enrolled ? this.state.enrolledColor : '#FFFFFF'}`,
                            iconSize: '30',
                        },
                        {
                            id: 'waitlist',
                            value: 'Waitlist',
                            type: 'line',
                            color: `${this.state.wait ? this.state.waitColor : '#FFFFFF'}`,
                            iconSize: '30',
                        },
                        {
                            id: 'requested',
                            value: 'Requested',
                            type: 'line',
                            color: `${this.state.req ? this.state.reqColor : '#FFFFFF'}`,
                            iconSize: '30',
                        },
                    ]}
                />
            </AreaChart>
        );
    }
}
