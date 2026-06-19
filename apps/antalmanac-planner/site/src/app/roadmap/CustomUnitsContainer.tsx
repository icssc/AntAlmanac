import { pluralize } from '../../helpers/util';
import './CustomUnitsContainer.scss';
import { FC, FormEvent, useState } from 'react';

import ModeEditIcon from '@mui/icons-material/ModeEdit';
import CheckIcon from '@mui/icons-material/Check';
import { IconButton, TextField } from '@mui/material';

interface UnitsContainerProps {
  units: number | undefined;
  setUnits?: (value: number | undefined) => void;
  minUnits: number | undefined;
  maxUnits: number | undefined;
  source: string;
}
const UnitsContainer: FC<UnitsContainerProps> = ({ units, setUnits, minUnits, maxUnits, source }) => {
  const [editing, setEditing] = useState(false);

  if (!editing || !setUnits) {
    return (
      <>
        <p className="units-display">
          {source === 'MenuTile' || units ? units : `${minUnits}-${maxUnits}`} {}
          {pluralize(units ?? 0, 'units', 'unit')}
        </p>
        {setUnits && (
          <IconButton onClick={() => setEditing(true)}>
            <ModeEditIcon />
          </IconButton>
        )}
      </>
    );
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const unitsValue = parseFloat(formData.get('units') as string);
    setUnits(isNaN(unitsValue) ? undefined : unitsValue);
    setEditing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* eslint-disable jsx-a11y/no-autofocus */}
      <TextField
        className="units-input"
        type="number"
        placeholder={maxUnits !== undefined ? `${minUnits}-${maxUnits}` : 'Units'}
        name="units"
        defaultValue={units}
        autoFocus
        slotProps={{
          htmlInput: {
            min: minUnits ? minUnits : '0',
            max: maxUnits ? maxUnits : undefined,
            step: 'any',
          },
        }}
      />
      {/* eslint-enable jsx-a11y/no-autofocus */}
      <IconButton type="submit">
        <CheckIcon />
      </IconButton>
    </form>
  );
};

export default UnitsContainer;
