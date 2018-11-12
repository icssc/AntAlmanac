import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';

const styles = () => ({
    multiline: {
        whiteSpace: 'pre'
    },
});

class GraphRenderPane extends Component {
    constructor(props) {
        super(props);
        this.state = {graph: {__html: null}}
    }

    componentDidMount() {
        this.controller = new window.AbortController();
        this.signal = this.controller.signal;
        this.fetchGraph(this.props.quarter, this.props.year, this.props.section.classCode);
    }

    componentWillUnmount() {
        this.controller.abort();
    }

    componentDidUpdate(prevProps, prevState, prevContext) {
        if (prevProps !== this.props) {
            this.fetchGraph(this.props.quarter, this.props.year, this.props.section.classCode);
        }
    }

    fetchGraph(quarter, year, code) {
        const url = `https://l5qp88skv9.execute-api.us-west-1.amazonaws.com/dev/${quarter}/${year}/${code}`;

        fetch(url, {signal: this.signal})
            .then(resp =>
                resp.text()
            )
            .then(resp => {
                this.setState({graph: {__html: resp}});
            });
    }

    render() {
        return (
            <div>
                <table>
                    <tbody>
                    <tr>
                        <th>Type</th>
                        <th>Instructors</th>
                        <th>Times</th>
                        <th>Places</th>
                        <th>Max Cap</th>
                    </tr>
                    <tr>
                        <td className={this.props.classes.multiline}>
                            {
                                `${this.props.section.classType}
Section: ${this.props.section.sectionCode}
Units: ${this.props.section.units}`
                            }</td>
                        <td className={this.props.classes.multiline}>{this.props.section.instructors.join('\n')}</td>
                        <td className={this.props.classes.multiline}>{this.props.section.meetings.map(meeting => meeting[0]).join('\n')}</td>
                        <td className={this.props.classes.multiline}>{this.props.section.meetings.map(meeting => meeting[1]).join('\n')}</td>
                        <td>{this.props.section.maxCapacity}</td>
                    </tr>
                    </tbody>
                </table>
                {<div style={{width: '75%'}} dangerouslySetInnerHTML={this.state.graph}/>}
            </div>
        );
    }
}

export default withStyles(styles)(GraphRenderPane);