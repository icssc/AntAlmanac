import { FC } from 'react';
import './Error.scss';
import noResultsImg from '../../asset/no-results-crop.webp';
import Image from 'next/image';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface ErrorProps {
  message?: string;
}

const Error: FC<ErrorProps> = (props) => {
  return (
    <div className="error">
      <Image src={noResultsImg.src} width={noResultsImg.width / 2} height={noResultsImg.height / 2} alt="no results" />
      <Typography variant="h5" component="h1" gutterBottom>
        404 PAGE NOT FOUND
      </Typography>
      {props.message && (
        <Typography variant="subtitle2" component="h2" color="textSecondary">
          {props.message}
        </Typography>
      )}
      <Button variant="contained" href="/planner">
        Go to Roadmap
      </Button>
    </div>
  );
};

export default Error;
