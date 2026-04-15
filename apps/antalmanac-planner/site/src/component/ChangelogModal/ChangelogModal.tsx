'use client';
import { useEffect, useState } from 'react';
import './ChangelogModal.scss';
import changelogImage from '../../asset/merge-switcher.jpg';
import Image from 'next/image';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link } from '@mui/material';

const CUSTOM_TITLE = 'PeterPortal is now AntAlmanac Planner!'; // If ommitted, defaults to "What's New – {Month} {Year}"
const DESCRIPTION = (
  <p>
    AntAlmanac and PeterPortal are now unified into the ultimate course planning app. Learn more in our{' '}
    <Link href="https://docs.icssc.club/docs/about/antalmanac/merge" target="_blank">
      blog post
    </Link>
    !
  </p>
);
const LAST_UPDATED = '01/30/2026';

const ChangelogModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // display the changelog modal if it is the user's first time seeing it (tracked in local storage)
    const lastSeen = localStorage.getItem('changelogSeen');

    if (lastSeen !== LAST_UPDATED) {
      setShowModal(true);

      // mark as seen so it is not displayed after seeing it once
      localStorage.setItem('changelogSeen', LAST_UPDATED);
    }
  }, []);

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <Dialog open={showModal} onClose={closeModal} className="changelog-modal">
      <DialogTitle>
        {CUSTOM_TITLE ||
          `What's New – ${new Date(LAST_UPDATED).toLocaleString('default', { month: 'long', year: 'numeric' })}`}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{DESCRIPTION}</DialogContentText>
        <Image
          className="modal-img"
          src={changelogImage.src}
          width={changelogImage.width}
          height={changelogImage.height}
          alt="Screenshot or gif of new changes"
        />
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={closeModal}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangelogModal;
