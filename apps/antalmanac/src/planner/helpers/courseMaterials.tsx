import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SouthOutlinedIcon from '@mui/icons-material/SouthOutlined';
import Link from 'next/link';

interface MaterialsIconParams {
    showLabel?: boolean;
}

const iconStyle: React.CSSProperties = {
    position: 'relative',
    width: 16,
    height: 16,
    flexShrink: 0,
    color: 'var(--planner-palette-success-light)',
    transform: 'translateY(-2px)',
};

const labelStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    color: 'var(--planner-palette-success-light)',
    textDecoration: 'none',
    marginBottom: '16px',
};

const libraryLink = 'https://www.lib.uci.edu/affordable-initiatives/course-materials';

export default function MaterialsIcon({ showLabel = false }: MaterialsIconParams) {
    return (
        <Link href={libraryLink} rel="noopener noreferrer" target="_blank" style={labelStyle}>
            <div className="materials-icon" style={iconStyle}>
                <AttachMoneyIcon />
                <SouthOutlinedIcon
                    sx={{
                        fontSize: '13px',
                        position: 'absolute',
                        bottom: '-12px',
                        right: '-9px',
                    }}
                />
            </div>
            {showLabel && <p style={{ margin: 0 }}>Low-Cost Materials</p>}
        </Link>
    );
}
