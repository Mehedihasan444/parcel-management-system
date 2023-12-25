import { Helmet } from "react-helmet-async";
import Banner from "./Banner";
import OurFeatures from "./OurFeatures";
import TheTopDeliveryMan from "./TheTopDeliveryMan";


const Home = () => {
    return (
        <div>
            <Helmet>
                <title> Parcel Management App | Home</title>
            </Helmet>
            <Banner></Banner>
            <OurFeatures></OurFeatures>
            <TheTopDeliveryMan></TheTopDeliveryMan>
        </div>
    );
};

export default Home;