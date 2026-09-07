import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./header.component";
import Footer from "./footer.component";
import QuickAccessToolbar from "./quick-access-toolbar.component";
import { DASHBOARD_COLORS } from "../components/dashboard/dashboard-theme";

const MainMenu = () => {
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);

  return (
    <div className="flex m-auto min-h-screen overflow-hidden h-screen w-screen">
      <div className="flex flex-col w-full h-full">
        {/* Header Container */}
        <div
          className="flex justify-center py-2 bg-linear-to-r
                     from-gray-500 via-gray-700 to-gray-900"
        >
          <Header
            toolbarCollapsed={toolbarCollapsed}
            onToggleToolbar={() => setToolbarCollapsed((c) => !c)}
          />
        </div>

        {/* Quick-access toolbar - unmounted entirely when collapsed, so no
            residual strip/border line is left under the header. */}
        {!toolbarCollapsed && <QuickAccessToolbar />}

        {/* Page Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: DASHBOARD_COLORS.pageBg }}
        >
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
