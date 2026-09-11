import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./header.component";
import Footer from "./footer.component";
import QuickAccessToolbar from "./quick-access-toolbar.component";
import { DASHBOARD_COLORS } from "../components/dashboard/dashboard-theme";
import { getCurrentUser } from "../sagaStore/user/user.selector";

const MainMenu = () => {
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  // MainMenu wraps /sign-in too (it's not a separate unmounted layout), so
  // the toolbar must be gated on auth, not just the user's collapse choice -
  // otherwise a signed-out user sees a toolbar full of icons/pins that lead
  // nowhere (either stale cached prefs from the previous session, or a
  // default set with no real access behind it).
  const currentUserEmail = useSelector(getCurrentUser);

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

        {/* Quick-access toolbar - unmounted entirely when collapsed, or when
            signed out (see currentUserEmail above), so no residual
            strip/border line or dead-end icons are left showing. */}
        {!toolbarCollapsed && !!currentUserEmail && <QuickAccessToolbar />}

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
