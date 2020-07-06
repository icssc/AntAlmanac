import React, { Fragment, PureComponent } from 'react';
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = {
    ad: {
        display: 'inline',
        width: '100%',
    },
};

class AdBanner extends PureComponent {
    render () {
        const { classes } = this.props;

        return (
            <Fragment>
                <Typography fontSize="1" align="right">
                    AntAlmanac is not affiliated with the following club/activity
                </Typography>

                <a href={this.props.bannerLink}
                   target="_blank"
                   rel="noopener noreferrer">
                    <img
                        src={`/api/getAdImage/${this.props.bannerName}`}
                        alt="banner"
                        className={classes.ad}
                    /></a>
            </Fragment>
        );
    }
}

AdBanner.propTypes = {
    bannerName: PropTypes.string.isRequired,
    bannerLink: PropTypes.string.isRequired
};

export default withStyles(styles)(AdBanner);