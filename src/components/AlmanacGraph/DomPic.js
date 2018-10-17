import React from 'react'; 
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import html2canvas from 'html2canvas';


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

function IconButtons(props) {
  const { classes } = props;
  return (
    <div>
        <IconButton onClick={()=>{
           html2canvas(document.getElementById("cal")).then(function(canvas) {
           let img = canvas.toDataURL("image/png");
           let lnk = document.createElement('a'), e;
               /// the key here is to set the download attribute of the a tag
               lnk.download = "Schedule.png";
               /// convert canvas content to data-uri for link. When download
               /// attribute is set the content pointed to by link will be
               /// pushed as "download" in HTML5 capable browsers
               lnk.href = img;
               /// create a "fake" click-event to trigger the download
               if (document.createEvent) {
                 e = document.createEvent("MouseEvents");
                 e.initMouseEvent("click", true, true, window,
                                  0, 0, 0, 0, 0, false, false, false,
                                  false, 0, null);
                 lnk.dispatchEvent(e);
               } else if (lnk.fireEvent) {
                 lnk.fireEvent("onclick");
               }
        });
        }} color="primary" className={classes.button} component="span">
          <PhotoCamera />
        </IconButton>
    </div>
  );
}
IconButtons.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(IconButtons);
