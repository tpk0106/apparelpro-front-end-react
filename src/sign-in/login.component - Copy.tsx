import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { signOutStart } from "../sagaStore/user/user.action";
import { getCurrentUser } from "../sagaStore/user/user.selector";
import { USER_CREDENTIALS } from "../interfaces/definitions";
//import { PowerIcon } from "@heroicons/react/24/solid";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogOut = () => {
    dispatch(signOutStart());
    navigate("/sign-in");
  };

  // 1. Read directly from the Redux selector (This forces React to re-render when it changes)
  const currUser = useSelector(getCurrentUser);

  // 2. AUTOMATIC ROUTING: When currUser changes from null to a string value, instantly redirect home
  useEffect(() => {
    console.log("current User from store : ", currUser);
    console.log("user key : ", USER_CREDENTIALS.USER_KEY);

    if (currUser) {
      navigate("/");
    }
  }, [currUser, navigate]);

  return (
    <div>
      {!currUser ? (
        <Button
          variant="text"
          className="hidden lg:inline-block"
          onClick={() => {
            navigate("/sign-in");
          }}
        >
          Sign In
        </Button>
      ) : (
        <Button
          variant="text"
          className="hidden lg:inline-block"
          onClick={handleLogOut}
        >
          <span>
            <PowerSettingsNewOutlinedIcon className="hover:text-white" />
          </span>
        </Button>
      )}
    </div>
  );
};

export default Login;
