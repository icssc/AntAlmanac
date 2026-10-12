import './CatalogYears.scss';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { MenuItem, Select, Tooltip, IconButton } from '@mui/material';
import { FC, useState } from 'react';

import { getCatalogYearDefaults, formatCatalogYear } from '../../../helpers/courseRequirements';

interface CatalogYearsProps {
    catalogYear: string | null;
    tab: 'major' | 'minor';
    onChange: (newCatalogYear: string) => Promise<void>;
}

const CatalogYears: FC<CatalogYearsProps> = ({ catalogYear, tab, onChange }) => {
    const { defaultCatalogYear, catalogYearOptions } = getCatalogYearDefaults();

    const [editing, setEditing] = useState(false);
    const [selected, setSelected] = useState(catalogYear ?? defaultCatalogYear);

    const selectedDisp = formatCatalogYear(selected);

    const pressEditButton = () => {
        if (editing) {
            onChange(selected);
            setEditing(false);
        } else {
            setEditing(true);
        }
    };

    return (
        <div className="catalog-years">
            {!editing && (
                <Tooltip
                    title={`The catalog year these requirements are from. Likely the year you entered UCI or declared this ${tab}.`}
                    placement="bottom-start"
                    slotProps={{
                        tooltip: { className: 'catalog-year-tooltip' },
                        popper: {
                            modifiers: [{ name: 'offset', options: { offset: [0, -8] } }],
                        },
                    }}
                    disableInteractive
                >
                    <span className="catalog-year-title">{selectedDisp}</span>
                </Tooltip>
            )}
            {editing && (
                <Select
                    size="xsmall"
                    IconComponent={KeyboardArrowDownIcon}
                    labelId="catalog-year-select-label"
                    id="catalog-year-select"
                    value={selected}
                    onChange={(event) => setSelected(event.target.value)}
                >
                    {catalogYearOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            )}
            <IconButton
                className={editing ? 'confirm-btn' : 'edit-btn'}
                onClick={pressEditButton}
                aria-label="Edit catalog year"
            >
                {editing ? <CheckIcon /> : <ModeEditIcon />}
            </IconButton>
        </div>
    );
};

interface CatalogYearWarningProps {
    catalogYear: string | null;
    fallback: string;
}

export const CatalogYearWarning: FC<CatalogYearWarningProps> = ({ catalogYear, fallback }) => {
    const { defaultCatalogYear } = getCatalogYearDefaults();

    return (
        <div className="catalog-year-warning">
            <WarningAmberIcon className="warning-icon" />
            <p className="catalog-year-warning-text">
                {formatCatalogYear(catalogYear ?? defaultCatalogYear)} requirements are not yet publicly available.
                Currently showing {formatCatalogYear(fallback)}.
            </p>
        </div>
    );
};

export default CatalogYears;
