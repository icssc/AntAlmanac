import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';

class CourseInfoButton extends PureComponent {
    render() {
        const { text, icon, redirectLink } = this.props;
        return (
            <Button
                endIcon={icon}
                variant="contained"
                size="small"
                style={{ marginRight: '4px', backgroundColor: '#385EB1', color: '#fff' }}
                onClick={(event) => {
                    window.open(redirectLink);
                }}
            >
                {text}
            </Button>
        );
    }
}

CourseInfoButton.propTypes = {
    text: PropTypes.string.isRequired,
    icon: PropTypes.object.isRequired,
    redirectLink: PropTypes.string.isRequired,
};

export default CourseInfoButton;
