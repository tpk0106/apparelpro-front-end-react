import { Outlet } from "react-router-dom";
import Header from "./header.component";
import Footer from "./footer.component";

const MainMenu = () => {
  return (
    <div className="flex m-auto min-h-screen overflow-hidden h-screen w-screen">
      <div className="flex flex-col w-full h-full">
        {/* Header Container */}
        <div
          className="flex justify-center py-2 bg-linear-to-r 
                     from-gray-500 via-gray-700 to-gray-900"
        >
          <Header />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Footer Container */}
        <div className="flex flex-col w-full h-[9%] border-2 border-gray-600 justify-center bg-black text-blue-500">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
