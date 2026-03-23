import { FC, KeyboardEvent, useEffect, useState } from 'react';
import './SearchFilters.scss';

import CheckIcon from '@mui/icons-material/Check';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Icon, MenuProps, TextField } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../store/hooks';

import { FilterOptions, levels } from '../../helpers/searchFilters.ts';
import { selectCourseFilters, setCourseFilters } from '../../store/slices/searchSlice.ts';
import { GE_TITLE_MAP } from '../../helpers/courseRequirements.ts';

const menuProps: Partial<MenuProps> = {
  anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  slotProps: {
    paper: { className: 'search-filters-menu' },
  },
};

function briefLabel(selected: string[], defaultLabel: string) {
  if (selected.length == 0) return defaultLabel;
  if (selected.length == 1) return selected[0];

  return `${selected[0]} +${selected.length - 1}`;
}

function DepartmentSelect() {
  const departments = useAppSelector((state) => state.departments.departments);
  const selectedFilters = useAppSelector(selectCourseFilters);
  const dispatch = useAppDispatch();
  const [inputEl, setInputEl] = useState<HTMLInputElement | null>(null);
  const [deptFilterText, setDeptFilterText] = useState('');

  const handleDepartmentSelection = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const valueArray = typeof value === 'string' ? value.split(',') : value;

    const validValues = valueArray.filter((val) => val in departments);
    const unchanged =
      selectedFilters.departments.length === validValues.length &&
      selectedFilters.departments.every((oldDept, i) => validValues[i] === oldDept);
    if (unchanged) return;

    dispatch(setCourseFilters({ ...selectedFilters, departments: validValues }));
  };

  const handleTextKeydown = (event: KeyboardEvent) => {
    const allowedMenuKeys = ['Escape', 'UpArrow', 'DownArrow', 'Enter'];
    if (allowedMenuKeys.includes(event.key)) return;
    event.stopPropagation();
  };

  // Cannot use refs because refs can't be used as hook dependencies
  useEffect(() => {
    inputEl?.focus();
  }, [inputEl]);

  const paperProps = {
    className: 'search-filters-menu departments-menu',
  };

  return (
    <Select
      size="xsmall"
      displayEmpty
      multiple
      value={selectedFilters.departments}
      MenuProps={{
        ...menuProps,
        slotProps: { paper: paperProps },
      }}
      onChange={handleDepartmentSelection}
      className={selectedFilters.departments.length > 0 ? 'has-selection' : ''}
      renderValue={(selected) => briefLabel(selected, 'Departments')}
    >
      <TextField
        key="fixed"
        className="dept-input"
        variant="filled"
        placeholder="Enter a department..."
        onKeyDown={handleTextKeydown}
        defaultValue={deptFilterText}
        value={deptFilterText}
        onChange={(event) => setDeptFilterText(event.target.value)}
        inputRef={setInputEl}
      />
      {Object.entries(departments).map(([code, name]) => {
        const labelText = `${code}: ${name}`;
        const matchesFilter = labelText.toLowerCase().includes(deptFilterText.toLowerCase());

        return (
          <MenuItem key={code} value={code} className={`search-filter-item ${!matchesFilter ? 'hidden' : ''}`}>
            {selectedFilters.departments.includes(code) ? <CheckIcon /> : <Icon />}
            <ListItemText className="item-text" primary={labelText} />
          </MenuItem>
        );
      })}
    </Select>
  );
}

const SearchFilters: FC = () => {
  const selectedFilters = useAppSelector(selectCourseFilters);
  const dispatch = useAppDispatch();

  const updateSelectedFilters = (newFilters: FilterOptions) => {
    dispatch(setCourseFilters(newFilters));
  };

  const handleLevelSelection = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;

    const valueArray = typeof value === 'string' ? value.split(',') : value;
    const validValues = valueArray.filter((val) => val in levels);

    updateSelectedFilters({ ...selectedFilters, levels: validValues });
  };

  const handleGeCategorySelection = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;

    const valueArray = typeof value === 'string' ? value.split(',') : value;

    updateSelectedFilters({
      ...selectedFilters,
      geCategories: valueArray,
    });
  };

  return (
    <div className="filter-group">
      <FormControl className="filter-form-control">
        <Select
          size="xsmall"
          multiple
          value={selectedFilters.levels}
          onChange={handleLevelSelection}
          displayEmpty
          className={selectedFilters.levels.length > 0 ? 'has-selection' : ''}
          renderValue={(selected) => briefLabel(selected, 'Level')}
          MenuProps={menuProps}
        >
          {Object.entries(levels).map(([key, value]) => (
            <MenuItem key={key} value={key} className="search-filter-item">
              {selectedFilters.levels.includes(key) ? <CheckIcon /> : <Icon />}
              <ListItemText primary={value} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className="filter-form-control">
        <Select
          size="xsmall"
          multiple
          value={selectedFilters.geCategories}
          onChange={handleGeCategorySelection}
          displayEmpty
          className={selectedFilters.geCategories.length > 0 ? 'has-selection' : ''}
          renderValue={(selected) => briefLabel(selected, 'GE')}
          MenuProps={menuProps}
        >
          {Object.entries(GE_TITLE_MAP).map(([key, value]) => (
            <MenuItem key={key} value={key} className="search-filter-item">
              {selectedFilters.geCategories.includes(key) ? <CheckIcon /> : <Icon />}
              <ListItemText primary={value} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <DepartmentSelect />
    </div>
  );
};

export default SearchFilters;
