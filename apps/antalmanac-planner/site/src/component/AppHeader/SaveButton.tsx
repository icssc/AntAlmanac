import { FC, useState } from 'react';
import { useSaveRoadmap } from '../../hooks/planner';
import { Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const SaveButton: FC = () => {
  const { handler: saveRoadmap } = useSaveRoadmap();

  const [saveInProgress, setSaveInProgress] = useState(false);

  const handleSave = () => {
    setSaveInProgress(true);
    saveRoadmap().finally(() => setSaveInProgress(false));
  };

  return (
    <Button
      className="header-button"
      variant="text"
      size="medium"
      startIcon={<SaveIcon />}
      loading={saveInProgress}
      onClick={handleSave}
      color="inherit"
    >
      Save
    </Button>
  );
};

export default SaveButton;
