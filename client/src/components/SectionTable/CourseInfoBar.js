import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, Popover } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { MoreVert } from '@material-ui/icons';
import { PETERPORTAL_REST_ENDPOINT } from '../../api/endpoints';

const styles = () => ({
    rightSpace: {
        marginRight: 4,
    },
    button: {
        backgroundColor: '#72a9ed',
        boxShadow: 'none',
    },
    courseInfoPane: {
        margin: 10,
        width: 500,
    },
    skeleton: {
        margin: 10,
        width: 500,
        height: 150,
    },
});

class CourseInfoBar extends PureComponent {
    state = {
        loading: true,
        anchorEl: null,
        title: null,
        prerequisite_text: null,
        prerequisite_for: null,
        description: null,
    };

    togglePopover = async (currentTarget) => {
        if (Boolean(this.state.anchorEl)) {
            this.setState({ anchorEl: false });
        } else {
            this.setState({ anchorEl: currentTarget });

            if (this.state.loading === true) {
                const { courseNumber, deptCode } = this.props;
                try {
                    const courseId = encodeURIComponent(
                        `${deptCode.replace(/\s/g, '')}${courseNumber.replace(/\s/g, '')}`
                    );
                    const response = await fetch(`${PETERPORTAL_REST_ENDPOINT}/courses/${courseId}`);

                    if (response.ok) {
                        const jsonResp = await response.json();

                        this.setState({
                            anchorEl: currentTarget,
                            loading: false,
                            title: jsonResp.title,
                            prerequisite_text: jsonResp.prerequisite_text,
                            prerequisite_for: jsonResp.prerequisite_for.join(', '),
                            description: jsonResp.description,
                        });
                    } else {
                        this.setState({
                            anchorEl: currentTarget,
                            loading: false,
                            title: 'No description available',
                            prerequisite_text: '',
                            prerequisite_for: '',
                            description: '',
                        });
                    }
                } catch (e) {
                    this.setState({
                        anchorEl: currentTarget,
                        loading: false,
                        title: 'No description available',
                        prerequisite_text: '',
                        prerequisite_for: '',
                        description: '',
                    });
                }
            }
        }
    };

    getPopoverContent = () => {
        if (this.state.loading) {
            return (
                <div className={this.props.classes.skeleton}>
                    <p>
                        <Skeleton variant="text" animation="wave" height={30} width="50%" />
                    </p>
                    <p>
                        <Skeleton variant="text" animation="wave" />
                        <Skeleton variant="text" animation="wave" />
                        <Skeleton variant="text" animation="wave" />
                        <Skeleton variant="text" animation="wave" />
                        <Skeleton variant="text" animation="wave" />
                    </p>
                </div>
            );
        } else {
            return (
                <div className={this.props.classes.courseInfoPane}>
                    <p>
                        <strong>{this.state.title}</strong>
                    </p>
                    <p>{this.state.description}</p>
                    {this.state.prerequisite_text !== '' ? (
                        <p>
                            <span className={this.props.classes.rightSpace}>Prerequisites:</span>
                            {this.state.prerequisite_text}
                        </p>
                    ) : null}
                    {this.state.prerequisite_for !== '' ? (
                        <p>
                            <span className={this.props.classes.rightSpace}>Prerequisite For:</span>
                            {this.state.prerequisite_for}
                        </p>
                    ) : null}
                </div>
            );
        }
    };

    render() {
        const { courseTitle, courseNumber, deptCode } = this.props;

        return (
            <Fragment>
                <Button
                    variant="contained"
                    size="small"
                    onClick={(event) => {
                        const currentTarget = event.currentTarget;
                        this.togglePopover(currentTarget);
                    }}
                    style={{ marginRight: '4px' }}
                >
                    {`${deptCode} ${courseNumber} | ${courseTitle}`}
                    <MoreVert fontSize="small" />
                </Button>
                <Popover
                    anchorEl={this.state.anchorEl}
                    open={Boolean(this.state.anchorEl)}
                    onClose={() => this.togglePopover(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    {this.getPopoverContent()}
                </Popover>
            </Fragment>
        );
    }
}

CourseInfoBar.propTypes = {
    classes: PropTypes.object.isRequired,
    courseTitle: PropTypes.string.isRequired,
    courseNumber: PropTypes.string.isRequired,
    deptCode: PropTypes.string.isRequired,
};

export default withStyles(styles)(CourseInfoBar);
