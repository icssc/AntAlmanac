import './MenuTile.scss';
import ClickableDiv from '$planner/component/ClickableDiv/ClickableDiv';
import UnreadDot from '$planner/component/UnreadDot/UnreadDot';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IconButton } from '@mui/material';
import { type FC, type ReactNode } from 'react';

import UnitsContainer from '../CustomUnitsContainer';

export interface MenuTileProps {
    children?: ReactNode;
    title: string;
    units?: number;
    setUnits?: (value: number) => void;
    deleteFn?: () => void;
    /** Additional items to include alongsite the title */
    headerItems?: ReactNode;
    unread?: boolean;
    onClick?: () => void;
}

const MenuTile: FC<MenuTileProps> = ({ children, title, units, setUnits, deleteFn, headerItems, unread, onClick }) => {
    const handleUnitsChange = (value: number | undefined) => {
        if (value !== undefined && setUnits) {
            setUnits(value);
        }
    };

    return (
        <ClickableDiv className="menu-tile" onClick={onClick}>
            <UnreadDot show={unread ?? false} displayFullNewText={true} />
            <div className="tile-info">
                <div className="name">
                    {title} {headerItems}
                </div>
                <hr />
                {units !== undefined && (
                    <UnitsContainer
                        units={units}
                        setUnits={setUnits ? handleUnitsChange : undefined}
                        minUnits={0}
                        maxUnits={undefined}
                        source="MenuTile"
                    />
                )}
                {deleteFn && (
                    <IconButton className="delete-btn" onClick={deleteFn}>
                        <DeleteOutlineIcon />
                    </IconButton>
                )}
            </div>
            {children}
        </ClickableDiv>
    );
};

export default MenuTile;
