/* eslint-disable @typescript-eslint/no-unused-vars */
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
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";

import LogoutIcon from "@mui/icons-material/Logout";

import styles from "../app.module.css";
import {
  signOutStart,
  getUserByEmailStart,
} from "../sagaStore/user/user.action";

import {
  getCurrentUser,
  getCurrentUserDetails,
} from "../sagaStore/user/user.selector";
import { isAdministrator } from "../auth/jwt.util";
import { ListItemIcon } from "@mui/material";

const NavBarUserMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const updatingProfileUserEmail = useSelector(getCurrentUser);
  const userDetails = useSelector(getCurrentUserDetails);

  // Settings is Administrator-only - hidden from the menu entirely for every
  // other role. Computed fresh on each render (not memoized/stateful) so it
  // automatically reflects whichever token is current after a login/logout.
  const isAdmin = isAdministrator();

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
  function handleUpdateUser(_event: React.MouseEvent<HTMLElement>): void {
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

  function handleOpenSettings(_event: React.MouseEvent<HTMLElement>): void {
    navigate("/settings");
  }

  function handleLogout(_event: React.MouseEvent<HTMLElement>): void {
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
                <ListItemIcon
                  style={{
                    margin: "0",
                    justifyContent: "flex-start",
                  }}
                >
                  <AccountBoxOutlinedIcon />
                </ListItemIcon>
                <span
                  style={{
                    margin: "0",
                    display: "flex",
                    justifyItems: "start",
                  }}
                >
                  Update Profile
                </span>
              </Menu.Item>
              {isAdmin && (
                <Menu.Item
                  className={styles.MenuItem}
                  onClick={handleOpenSettings}
                  style={{
                    margin: "0",
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                >
                  <ListItemIcon>
                    <SettingsOutlinedIcon />
                  </ListItemIcon>
                  Settings
                </Menu.Item>
              )}
              <Menu.Item
                className={styles.MenuItem}
                style={{
                  margin: "0",
                  display: "flex",
                  justifyContent: "flex-start",
                }}
                // onClick={handleOpenSettings}
              >
                <ListItemIcon
                  style={{
                    margin: "0",
                    justifyContent: "flex-start",
                  }}
                >
                  <FavoriteBorderOutlinedIcon />
                </ListItemIcon>
                <span
                  style={{
                    margin: "0",
                    display: "flex",
                    justifyItems: "start",
                  }}
                >
                  Favorites
                </span>
              </Menu.Item>

              <Menu.Separator
                className={`${styles.MenuSeparator} h-px my-1 bg-gray-200`}
              />

              <Menu.Item
                className={styles.MenuItem}
                onClick={handleLogout}
                style={{
                  margin: "0",
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <ListItemIcon
                  style={{
                    margin: "0",
                    justifyContent: "flex-start",
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <span
                  style={{
                    margin: "0",
                    display: "flex",
                    justifyItems: "start",
                  }}
                >
                  Logout
                </span>
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
