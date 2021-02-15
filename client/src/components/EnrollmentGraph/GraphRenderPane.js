import React, { PureComponent, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import PropTypes from 'prop-types';
import Graph from './Graph';

const styles = () => ({
    multiline: {
        whiteSpace: 'pre',
    },
    table: {
        borderCollapse: 'collapse',
        boxSizing: 'border-box',
        width: '100%',
        marginTop: '0.285rem',

        '& thead': {
            position: 'sticky',

            '& th': {
                border: '1px solid rgb(222, 226, 230)',
                fontSize: '0.85rem',
                fontWeight: '500',
                color: 'rgba(0, 0, 0, 0.54)',
                textAlign: 'left',
                verticalAlign: 'bottom',
            },
        },
    },
    tr: {
        fontSize: '0.85rem',
        '&:nth-child(odd)': {
            backgroundColor: '#f5f5f5',
        },

        '& td': {
            border: '1px solid rgb(222, 226, 230)',
            textAlign: 'left',
            verticalAlign: 'top',
        },
    },
});

class KeepMounted extends PureComponent {
    hasBeenMounted = false;
    render() {
        const { isMounted, render } = this.props;
        this.hasBeenMounted = this.hasBeenMounted || isMounted;
        return <div style={{ display: isMounted ? null : 'none' }}>{this.hasBeenMounted ? render() : null}</div>;
    }
}

class GraphRenderPane extends PureComponent {
    state = {
        graphOpen: false,
        reported: false,
    };

    toggleDisplayGraph = () => {
        this.setState({ graphOpen: !this.state.graphOpen });
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <table className={classes.table}>
                    <tbody>
                        <tr className={classes.tr}>
                            <th>Toggle Graph</th>
                            <th>Type</th>
                            <th>Instructors</th>
                            <th>Times</th>
                            <th>Places</th>
                            <th>Max Capacity</th>
                        </tr>
                        <tr className={classes.tr}>
                            <td style={{ textAlign: 'center' }}>
                                <Button
                                    variant="contained"
                                    onClick={() => this.toggleDisplayGraph()}
                                    style={{
                                        marginTop: 3,
                                        backgroundColor: '#72a9ed',
                                        boxShadow: 'none',
                                        width: '90%',
                                    }}
                                >
                                    {this.state.graphOpen ? 'Close' : 'Open'}
                                </Button>
                            </td>
                            <td className={classes.multiline}>
                                {`${this.props.pastSection.sectionType}
Section: ${this.props.pastSection.sectionCode}
Units: ${this.props.pastSection.units}`}
                            </td>
                            <td className={classes.multiline}>{this.props.pastSection.instructors.join('\n')}</td>
                            <td className={classes.multiline}>
                                {this.props.pastSection.meetings
                                    .map((meeting) => meeting.days + ' ' + meeting.time)
                                    .join('\n')}
                            </td>
                            <td className={classes.multiline}>
                                {this.props.pastSection.meetings.map((meeting) => meeting.bldg).join('\n')}
                            </td>
                            <td>{this.props.pastSection.maxCapacity}</td>
                        </tr>
                    </tbody>
                </table>
                <KeepMounted
                    isMounted={this.state.graphOpen}
                    render={() => (
                        <Graph pastSectionCode={this.props.pastSection.sectionCode} pastTerm={this.props.pastTerm} />
                    )}
                />
                <hr />
            </Fragment>
        );
    }
}

GraphRenderPane.propTypes = {
    pastSection: PropTypes.object.isRequired,
    pastTerm: PropTypes.string,
};

export default withStyles(styles)(GraphRenderPane);
