import { useNavigate } from "react-router-dom";
import { signOutStart } from "../sagaStore/user/user.action";
import { useDispatch } from "react-redux";

export const HandleLogout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  dispatch(signOutStart());
  navigate("/sign-in");
};
