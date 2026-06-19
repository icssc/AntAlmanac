import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link } from '@mui/material';
import './AboutDialog.scss';
import Image from 'next/image';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

const AboutDialog = ({ open, onClose }: AboutDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} className="about-dialog" maxWidth="md" fullWidth>
      <DialogTitle>About</DialogTitle>
      <DialogContent>
        <DialogContentText>
          AntAlmanac Planner is a course discovery and four-year planning tool for UCI students.
          <br />
          <br />
          AntAlmanac Planner was originally created in 2020 as <b>PeterPortal</b> by a team led by{' '}
          <Link color="secondary" target="_blank" rel="noopener noreferrer" href="https://github.com/uci-mars">
            @uci-mars
          </Link>
          . In February 2026, PeterPortal merged with AntAlmanac. Following the merger, PeterPortal was rebranded as{' '}
          <b>AntAlmanac Planner</b>, while the existing AntAlmanac became <b>AntAlmanac Scheduler</b>.
          <br />
          <br />
          This website is maintained by the{' '}
          <Link color="secondary" target="_blank" rel="noopener noreferrer" href="https://studentcouncil.ics.uci.edu/">
            ICS Student Council
          </Link>{' '}
          Projects Committee and built by students from the UCI community. Interested in helping out? Join the{' '}
          <Link color="secondary" target="_blank" rel="noopener noreferrer" href="https://discord.gg/GzF76D7UhY">
            ICSSC Projects Discord
          </Link>{' '}
          or explore our{' '}
          <Link
            color="secondary"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/icssc/peterportal-client"
          >
            repo on GitHub
          </Link>
          .
          <br />
          <br />
          To support the ongoing development and enhancement of AntAlmanac, consider making a{' '}
          <Link color="secondary" target="_blank" rel="noopener noreferrer" href="https://venmo.com/u/ICSSC">
            donation
          </Link>
          ; your generosity helps us continue our mission.
          <br />
          <br />
          <Link
            color="secondary"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/icssc/peterportal-client/graphs/contributors"
          >
            <div className="contributors-image">
              <Image
                src="https://contrib.rocks/image?repo=icssc/peterportal-client"
                alt="AntAlmanac Planner Contributors"
                width={1000}
                height={400}
              />
            </div>
          </Link>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AboutDialog;
