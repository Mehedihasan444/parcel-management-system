import AdminHomeBarChart from "../Components/AdminHomeBarChart/AdminHomeBarChart";
import AdminHomeLineChart from "../Components/AdminHomeLineChart/AdminHomeLineChart";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import DocumentTitle from "../Components/Seo/DocumentTitle";

const AdminHome = () => {
  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Admin overview" />
      <SectionTitle heading="Network overview" subHeading="Live operations" />
      <div className="grid gap-5 lg:grid-cols-2">
        <AdminHomeBarChart />
        <AdminHomeLineChart />
      </div>
    </div>
  );
};

export default AdminHome;
