import React from 'react';
import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Popover, Button } from '@material-ui/core';
import Share from '@material-ui/icons/Share';
import html2canvas from 'html2canvas';
import { FacebookShareButton, FacebookIcon } from 'react-share';
const styles = (theme) => ({
  typography: {
    margin: theme.spacing.unit * 2,
  },
});

class Sharing extends React.Component {
  state = {
    anchorEl: null,
    image: null,
    loading: true,
  };

  handleClick = (event) => {
    this.setState(
      {
        loading: true,
        anchorEl: event.currentTarget,
      },
      () => {
        this.props.onTakeScreenshot(() => {
          html2canvas(document.getElementById('screenshot')).then((canvas) => {
            let img = canvas.toDataURL('image/png');

            let arr = img.split(','),
              mime = arr[0].match(/:(.*?);/)[1],
              bstr = atob(arr[1]),
              n = bstr.length,
              u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            let file = new File([u8arr], 'ok', { type: mime });

            let formData = new FormData();

            formData.append(0, file);

            fetch(
              `https://jfz4nqa9na.execute-api.us-west-1.amazonaws.com/latest/image-upload`,
              {
                method: 'POST',
                body: formData,
              }
            )
              .then((res) => {
                if (!res.ok) {
                  throw res;
                }
                return res.json();
              })
              .then((images) => {
                this.setState({ image: images[0].secure_url, loading: false });
              })
              .catch((err) => {});
          });
        });
      }
    );
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  };

  dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <Fragment>
        <Button
          aria-owns={open ? 'simple-popper' : undefined}
          aria-haspopup="true"
          disableRipple={true}
          onClick={this.handleClick}
          className={'menu-button'}
          style={{
            width: '100%',
          }}
        >
          <Share /> FB Share
        </Button>
        <Popover
          id="simple-popper"
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          {/* {!this.state.loading ? (
            <FacebookShareButton url={this.state.image} quote="dsad">
              <FacebookIcon size={32} round />
            </FacebookShareButton>
          ) : null} */}
          <Typography className={classes.typography}>
            {!this.state.loading ? (
              <Typography>
                <Typography>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={this.state.image}
                  >
                    Image Link
                  </a>
                </Typography>
                <Typography>Share on:</Typography>
                <FacebookShareButton
                  url={this.state.image}
                  quote="Shared from Poor Peter's AntAlmanac: https://antalmanac.com/ !! "
                  hashtag="#AntAlmanac"
                  style={{ cursor: 'pointer' }}
                >
                  <FacebookIcon size={80} round />
                </FacebookShareButton>
              </Typography>
            ) : (
              <img
                src="https://media.giphy.com/media/b5YDpcfF7oBB3r3myx/giphy.gif"
                alt="Loading"
                title="Loading"
              />
            )}
          </Typography>
        </Popover>
      </Fragment>
    );
  }
}

Sharing.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Sharing);

// WEBPACK FOOTER //
// ./src/components/Calendar/Sharing.js
