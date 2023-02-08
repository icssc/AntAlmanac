import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { termData } from '$lib/termData';
import { useTermStore } from '$lib/stores/term';

export default function TermSelector() {
  const { term, setTerm } = useTermStore();

  function handleChange(e: SelectChangeEvent<string>) {
    setTerm(e.target.value);
  }

  return (
    <FormControl fullWidth>
      <InputLabel>Term</InputLabel>
      <Select value={term} onChange={handleChange} label="Term">
        {termData.map((term, index) => (
          <MenuItem key={index} value={term.shortName}>
            {term.longName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
