import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  Typography,
} from '@mui/material';
import { Info } from '@mui/icons-material';
import analyticsEnum, { logAnalytics } from '$lib/analytics';

interface Props {
  /**
   * can be open from outside component
   */
  open?: boolean;

  /**
   * set state from parent component
   */
  setOpen?: React.Dispatch<this['open']>;

  /**
   * whether to show a button to click (e.g. when inside a menu item, no button is needed)
   */
  button?: boolean;
}

export default function AboutModal(props: Props) {
  const { open, setOpen } = props;

  function openAbout() {
    setOpen(true);
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CLICK_ABOUT,
    });
  }

  function closeAbout(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setOpen(false);
  }

  return (
    <>
      {props.button ? (
        <Button onClick={openAbout} color="inherit" startIcon={<Info />}>
          About
        </Button>
      ) : (
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Info />
          <Typography>About</Typography>
        </Box>
      )}
      <Dialog open={open || false}>
        <DialogTitle>About</DialogTitle>
        <DialogContent>
          <DialogContentText>
            AntAlmanac is a schedule planning tool for UCI students.
            <br />
            <br />
            Interested in helping out? Join our{' '}
            <Link target="_blank" href="https://discord.gg/GzF76D7UhY" color="secondary">
              Discord
            </Link>{' '}
            or checkout the{' '}
            <Link target="_blank" href="https://github.com/icssc/AntAlmanac" color="secondary">
              code on GitHub
            </Link>
            .
            <br />
            <br />
            This website is maintained by the{' '}
            <Link target="_blank" href="https://studentcouncil.ics.uci.edu/" color="secondary">
              ICS Student Council
            </Link>{' '}
            Projects Committee and built by students from the UCI community.
            <br />
            <br />
            <Link target="_blank" href="https://github.com/icssc/AntAlmanac/contributors">
              <img
                src="https://contrib.rocks/image?repo=icssc/antalmanac"
                width={'100%'}
                alt="AntAlmanac Contributors"
              />
            </Link>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAbout} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
