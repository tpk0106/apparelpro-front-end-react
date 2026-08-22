import { useNavigate } from "react-router-dom";

import { Button } from "@mui/material";
import { useSelector } from "react-redux";

import { getCurrentUser } from "../sagaStore/user/user.selector";
import NavBarUserMenu from "./navbar-user-menu.component";
import LoginIcon from "@mui/icons-material/Login";

const Login = () => {
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
            className="hidden lg:inline-block hover:text-white"
            onClick={() => navigate("/sign-in")}
          >
            <LoginIcon className="hover:text-white" />
          </Button>
        ) : (
          <NavBarUserMenu />
        )}
      </div>
    </>
  );
};

export default Login;
