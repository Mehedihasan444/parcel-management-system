import DocumentTitle from "../../Components/Seo/DocumentTitle";
import Banner from "./Banner";
import OurFeatures from "./OurFeatures";
import TheTopDeliveryMen from "./TheTopDeliveryMen";
import Statistics from "./Statistics";

const Home = () => {
  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Home" />
      <Banner></Banner>
      <OurFeatures></OurFeatures>
      <Statistics></Statistics>
      <TheTopDeliveryMen></TheTopDeliveryMen>
    </div>
  );
};

export default Home;
