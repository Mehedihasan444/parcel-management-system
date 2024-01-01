const SectionTitle = ({ heading, subHeading }) => {
  return (
    <div className="mx-auto md:w-6/12 my-8 text-center mb-5">
      <p className="text-yellow-600 mb-2">---{subHeading}---</p>
      <h3 className="text-3xl font-bold sm:text-4xl uppercase sm:border-y-2 sm:py-4 ">{heading}</h3>
    </div>
  );
};

export default SectionTitle;
