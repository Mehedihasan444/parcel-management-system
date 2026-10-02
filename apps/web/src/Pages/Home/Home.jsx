import DocumentTitle from "../../Components/Seo/DocumentTitle";
import Banner from "./Banner";
import OurFeatures from "./OurFeatures";
import HowItWorks from "./HowItWorks";
import Pricing from "./Pricing";
import Statistics from "./Statistics";
import TheTopDeliveryMen from "./TheTopDeliveryMen";
import CtaBand from "./CtaBand";

const Home = () => {
  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Home" />
      <Banner />
      <OurFeatures />
      <HowItWorks />
      <Pricing />
      <Statistics />
      <TheTopDeliveryMen />
      <CtaBand />
    </div>
  );
};

export default Home;
