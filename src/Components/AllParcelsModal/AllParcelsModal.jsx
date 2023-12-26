import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useForm } from "react-hook-form";

const AllParcelsModal = ({id,email}) => {
  const axiosSecure = useAxiosSecure();

  const { data: deliveryMen = [], refetch } = useQuery({
    queryKey: ["allParcels"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      return res.data;
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()
  const onSubmit= (data) => {
    
    
    console.log(data)


    const info={
role:'deliveryMen'

    }
 axiosSecure.patch(`/users/${email}`,info)
 .then((res) => {
    console.log(res.data)
    
 })
 axiosSecure.patch(`/users/bookings/${id}`)
 .then((res) => {
    console.log(res.data)
 })

}


  return (
    <div>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
            <form method="dialog" >
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button> 
            </form>
            
            
          <form onSubmit={handleSubmit(onSubmit)} >
          
          
             <h3 className="font-bold text-2xl mb-5">Assign Delivery Man</h3>
          <div className="space-y-3" >
            <div className="flex justify-center items-center">
              <div className="flex flex-col ">
                <label htmlFor="deliveryMan" className="text-base text-left">
                  Select Delivery Man:
                </label>
                <select
                {...register("SelectedDeliveryMen")}
                  id="deliveryMan"
                  name="SelectedDeliveryMen"
                  className="select select-bordered w-full "
                  //   value={selectedDeliveryMan}
                  //   onChange={(e) => setSelectedDeliveryMan(e.target.value)}
                >
                  {/* Map through the delivery men array and create options */}
                  <option disabled selected>
                    Select Delivery Men
                  </option>
                  {deliveryMen.map((deliMan) => (
                    <option key={deliMan._id} value={deliMan._id}>
                      {deliMan.name} - {deliMan._id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <div className="flex flex-col ">
                <label htmlFor="deliveryDate" className="text-base text-left">
                  Select Approximate Delivery Date:
                </label>
                <input
                  {...register("approximateDeliveryDate")}
                  placeholder="Type here"
                  className="input input-bordered w-full sm:w-[430px]"
                  type="date"
                  name="approximateDeliveryDate"
                  id="deliveryDate"
                  // value={deliveryDate}
                  // onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
            </div>

            <button
              //   onClick={handleAssign}
              className="btn btn-primary "
            >
              Assign
            </button>
          </div>
          </form>
        
        </div>
      </dialog>
    </div>
  );
};

export default AllParcelsModal;

// import Modal from 'react-modal'; // Use the modal library of your choice
// import useAxiosSecure from '../Hooks/useAxiosSecure';
// import { useState } from 'react';

// const AllParcelsModal = ({ isOpen, onClose, bookingId, onUpdate }) => {
//   const axiosSecure = useAxiosSecure();

//   const [selectedDeliveryMan, setSelectedDeliveryMan] = useState('');
//   const [deliveryDate, setDeliveryDate] = useState('');

//   const handleAssign = async () => {
//     // Perform the logic to update the database here
//     try {
//       // Fetch delivery men from the database (adjust the endpoint accordingly)
//       const { data: deliveryMen=[] } = await axiosSecure.get('/deliverymen');

//       // Find the selected delivery man based on the ID
//       const selectedDeliveryManData = deliveryMen.find((man) => man._id === selectedDeliveryMan);

//       // Update the booking status and associate the delivery man
//       await axiosSecure.patch(`/bookings/${bookingId}`, {
//         status: 'On The Way',
//         deliveryMan: {
//           _id: selectedDeliveryManData._id,
//           name: selectedDeliveryManData.name,
//         },
//         deliveryDate,
//       });

//       // Trigger the parent component to update the UI or perform additional actions
//       onUpdate();
//       // Close the modal
//       onClose();
//     } catch (error) {
//       console.error('Error assigning delivery man:', error);
//       // Handle error, show notification, etc.
//     }
//   };

//   return (
//     <Modal isOpen={isOpen} onRequestClose={onClose}>

//     </Modal>
//   );
// };

// export default AllParcelsModal;
