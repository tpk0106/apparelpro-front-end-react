import { useNavigate } from "react-router-dom";
// import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import { Button } from "@mui/material";
import { useSelector } from "react-redux";

import { getCurrentUser } from "../sagaStore/user/user.selector";
import NavBarUserMenu from "./navbar-user-menu.component";

const Login = () => {
  // export const handleLogOut = () => {
  //   dispatch(signOutStart());
  //   navigate("/sign-in");
  // };

  const navigate = useNavigate();

  // 1. Read the user string ("John") straight from global Redux memory
  const currUser = useSelector(getCurrentUser);

  // 2. Clear out both Redux memory and browser storage on logout

  return (
    <>
      <div>
        {/* 4. Conditional UI Layout */}
        {!currUser ? (
          <Button
            variant="text"
            className="hidden lg:inline-block"
            onClick={() => navigate("/sign-in")}
          >
            Sign In
          </Button>
        ) : (
          <NavBarUserMenu />
          // <Button
          //   variant="text"
          //   className="hidden lg:inline-block"
          //    onClick={() => setShowMenu(true)}
          //   // onClick={handleLogOut}
          // >
          //   <span>
          //     <PowerSettingsNewOutlinedIcon className="hover:text-white" />
          //   </span>
          // </Button>
        )}
      </div>
    </>
  );
};

export default Login;
