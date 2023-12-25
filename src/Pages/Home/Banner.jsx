
const Banner = ({ setSearch }) => {
    const handelSearch = (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const searchValue = form.get('home-input');
        fetch(`https://jobdoc.vercel.app/searched-jobs/${searchValue}`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setSearch(data);
            })
    }
    return (
        <div className="hero min-h-screen mt-16 " style={{ backgroundImage: 'url(https://blogs.intugine.com/wp-content/uploads/2023/05/Parcel-management-system-1.png)' }}>
            <div className="hero-overlay bg-black bg-opacity-60"></div>
            <div className="hero-content text-center text-neutral-content">
                <div className="">
                    <span className="font-medium text-[#1CA774]">Book, Assign, and Deliver with Ease!</span>
                    <h1 className="mb-5 text-7xl font-bold text-white">Welcome to Our<br></br> <span className="text-[#1CA774]">Parcel Management</span>  Platform</h1>
                    <p className="mb-5 text-white w-1/2 mx-auto">Are you looking for a reliable and efficient way to manage parcel deliveries? Look no further! Our Parcel Management App simplifies the entire process, making it seamless for users, admins, and delivery personnel.
                  </p>
                  {/* text-[#1CA774]' */}
                    <div className="">
                        <form className="" onSubmit={handelSearch}>
                            <input name="home-input" type="text" placeholder="Search ..." className="input input-bordered input-accent w-full max-w-md bg-transparent" />
                            <button className="btn bg-[#1CA774] px-5 py-2 border-none font-bold text-white hover:btn-outline mt-5 lg:mt-0 lg:ml-5">Search</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;