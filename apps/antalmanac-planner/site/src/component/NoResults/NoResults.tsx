import { FC } from 'react';
import './NoResults.scss';
import noResultsImg from '../../asset/no-results-crop.webp';
import Image from 'next/image';

interface NoResultsProps {
  showPrompt: boolean;
  prompt: string;
}
const NoResults: FC<NoResultsProps> = ({ showPrompt, prompt }) => {
  return (
    <div className="no-results">
      <Image src={noResultsImg.src} width={noResultsImg.width} height={noResultsImg.height} alt="No results found" />
      {showPrompt ? prompt : "Sorry, we couldn't find any results for that search!"}
    </div>
  );
};

export default NoResults;
