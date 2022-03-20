import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';
import { useMediaQuery } from '@material-ui/core';

function CourseInfoButton({ text, icon, redirectLink }) {
    const isMobileScreen = useMediaQuery('max-width: 750px)');

    return (
        <Button
            startIcon={!isMobileScreen && icon}
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

//class CourseInfoButton extends PureComponent {
//    render() {
//        const { text, icon, redirectLink } = this.props;
//        return (
//            <Button
//                startIcon={!isMobileScreen && icon}
//                variant="contained"
//                size="small"
//                style={{ marginRight: '4px', backgroundColor: '#385EB1', color: '#fff' }}
//                onClick={(event) => {
//                    window.open(redirectLink);
//                }}
//            >
//                {text}
//            </Button>
//        );
//    }
//}

CourseInfoButton.propTypes = {
    text: PropTypes.string.isRequired,
    icon: PropTypes.object.isRequired,
    redirectLink: PropTypes.string.isRequired,
};

export default CourseInfoButton;
