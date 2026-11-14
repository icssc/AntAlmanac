import Button from '@mui/material/Button';

import './Error.scss';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { FC } from 'react';

import noResultsImg from '../../asset/no-results-crop.webp';

interface ErrorProps {
    message?: string;
    buttonHref?: string;
    buttonText?: string;
}

const Error: FC<ErrorProps> = (props) => {
    const { message, buttonHref = '/planner', buttonText = 'Go to Roadmap' } = props;

    return (
        <div className="error">
            <Image
                src={noResultsImg.src}
                width={noResultsImg.width / 2}
                height={noResultsImg.height / 2}
                alt="no results"
            />
            <Typography variant="h5" component="h1" gutterBottom>
                404 PAGE NOT FOUND
            </Typography>
            {message && (
                <Typography variant="subtitle2" component="h2" color="textSecondary">
                    {message}
                </Typography>
            )}
            <Button variant="contained" href={buttonHref}>
                {buttonText}
            </Button>
        </div>
    );
};

export default Error;
