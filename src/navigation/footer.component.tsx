const formatDate = () => new Date().toLocaleDateString();
const Footer = () => {
  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex flex-col w-full">
          <div className="flex justify-around w-[60%] m-auto tracking-[0.8em] text-[0.86em]">
            Broadsword Apparel Pvt Ltd
          </div>
          <div className="flex justify-around text-[0.66em]">
            {formatDate()} All rights reserved
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
