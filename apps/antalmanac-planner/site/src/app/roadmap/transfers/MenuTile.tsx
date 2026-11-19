import './MenuTile.scss';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IconButton } from '@mui/material';
import { FC, ReactNode } from 'react';

import ClickableDiv from '../../../component/ClickableDiv/ClickableDiv';
import UnreadDot from '../../../component/UnreadDot/UnreadDot';
import { useIsReadOnly } from '../../../hooks/planner';
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

const MenuTile: FC<MenuTileProps> = (props) => {
    const { children, title, units, headerItems, unread, onClick } = props;
    // Credits in a shared roadmap belong to its owner, so they can't be edited or removed
    const readOnly = useIsReadOnly();
    const setUnits = readOnly ? undefined : props.setUnits;
    const deleteFn = readOnly ? undefined : props.deleteFn;

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
