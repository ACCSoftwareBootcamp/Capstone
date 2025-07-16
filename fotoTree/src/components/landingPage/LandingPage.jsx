import './landingPage.css'
import Title from './Title';
import landingPageImg from '../../assets/landingPage.png'

const LandingPage = () => {
  return (
    <>
      <Title />
      <div>
      <h3>Every Family has a story to tell share yours on FotoTree</h3>
    <img src={landingPageImg} alt="Computer using FotoTree" />
      </div>
    </>
  );
};

export default LandingPage;
