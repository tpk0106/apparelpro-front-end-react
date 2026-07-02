import bgImage from "../assets/poster.jpg";

const Home = () => {
  return (
    <div
      className="inset-0 m-auto w-[98.5vw] h-[100vw] bg-cover bg1-center bg-no-repeat m1-0 p-0"
      style={{
        backgroundImage: `url(${bgImage})`,
        zIndex: -1, // Ensures it stays behind your content
      }}
    ></div>
  );
};

export default Home;
