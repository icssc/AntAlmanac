import './Disclaimer.scss';

const Disclaimer = () => {
  return (
    <p className="data-disclaimer">
      Data may not be fully accurate or up to date. Always double-check your plan with{' '}
      <a href="https://catalogue.uci.edu/" target="_blank" rel="noopener noreferrer">
        official UCI resources
      </a>{' '}
      and academic advisors.
    </p>
  );
};

export default Disclaimer;
