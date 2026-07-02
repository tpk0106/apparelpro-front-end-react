import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";

import { Menubar } from "@base-ui/react/menubar";
import { Menu } from "@base-ui/react/menu";
// import AddIcon from "@mui/icons-material/Add";
// import FolderOpenIcon from "@mui/icons-material/FolderOpen";
// import SaveIcon from "@mui/icons-material/Save";
// import PrintIcon from "@mui/icons-material/Print";
// import UndoIcon from "@mui/icons-material/Undo";
// import RedoIcon from "@mui/icons-material/Redo";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";

import styles from "../app.module.css";
import {
  signOutStart,
  getUserByEmailStart,
} from "../sagaStore/user/user.action";

import {
  getCurrentUser,
  getCurrentUserDetails,
} from "../sagaStore/user/user.selector";

const NavBarUserMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const updatingProfileUserEmail = useSelector(getCurrentUser);
  const userDetails = useSelector(getCurrentUserDetails);

  // 🚀 2. Create a silent mutable ref flag (starts as false)
  const shouldRedirectRef = useRef(false);

  // 🚀 3. REACTIVE EFFECT LAYER: Fully compliant, no cascading state changes!

  useEffect(() => {
    // If the data arrives and matches the current active user, transition safely!
    if (
      shouldRedirectRef.current &&
      userDetails &&
      userDetails.email === updatingProfileUserEmail
    ) {
      // Turn the flag off silently in memory.
      // No re-render loop triggered, fully legal inside useEffect.
      shouldRedirectRef.current = false;

      // Perform your route migration
      navigate("/sign-up", { state: userDetails });
    }
  }, [navigate, updatingProfileUserEmail, userDetails]);

  // 🚀 4. Simple, predictable button trigger
  function handleUpdateUser(event: React.MouseEvent<HTMLElement>): void {
    // Arm the silent trigger ref flag
    // Your brilliant Type Guard condition 🚀
    if (updatingProfileUserEmail) {
      // Arm the silent trigger ref flag
      shouldRedirectRef.current = true;

      // TypeScript is now happy because it knows this is strictly a string!
      dispatch(getUserByEmailStart(updatingProfileUserEmail));
    } else {
      console.warn("Cannot update profile: No active user session found.");
    }
  }

  function handleLogout(event: React.MouseEvent<HTMLElement>): void {
    dispatch(signOutStart());
    navigate("/sign-in");
  }

  return (
    <Menubar className={styles.Menubar}>
      <Menu.Root>
        <Menu.Trigger>
          <span className="text-blue-400 hover:text-white">
            <PowerSettingsNewOutlinedIcon className="hover:text-white" />
          </span>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={4} alignOffset={10}>
            <Menu.Popup className={styles.MenuPopup}>
              <Menu.Item className={styles.MenuItem} onClick={handleUpdateUser}>
                Update
              </Menu.Item>
              <Menu.Item className={styles.MenuItem}>Settings</Menu.Item>
              <Menu.Item className={styles.MenuItem}>Favorites</Menu.Item>
              <Menu.Separator className={styles.MenuSeparator} />
              <Menu.Item className={styles.MenuItem} onClick={handleLogout}>
                Logout
              </Menu.Item>
              <Menu.Separator />
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Menubar>
  );
};

export default NavBarUserMenu;
