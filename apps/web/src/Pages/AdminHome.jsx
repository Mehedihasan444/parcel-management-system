import AdminHomeBarChart from "../Components/AdminHomeBarChart/AdminHomeBarChart";
import AdminHomeLineChart from "../Components/AdminHomeLineChart/AdminHomeLineChart";
import SectionTitle from "../Components/SectionTitle/SectionTitle";


const AdminHome = () => {
 

  return (
    <div className="">
        <SectionTitle heading={"Statistics"} subHeading={"App Usage"}></SectionTitle>
          <div className="flex justify-between ">
     <div className="w-1/2 mx-auto" >
        <AdminHomeBarChart></AdminHomeBarChart>
     </div>
     <div className="w-1/2 mx-auto" >
        <AdminHomeLineChart></AdminHomeLineChart>

     </div>
    </div>
    </div>
  
  );
};

export default AdminHome;
