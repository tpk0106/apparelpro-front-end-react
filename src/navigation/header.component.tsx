import { useEffect, useState } from "react";
import { ExpandMoreOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";

import {
  Card,
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  List,
  ListItem,
  ThemeProvider,
} from "@mui/material";

// import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import MenuIcon from "../themes/menu-icon.component";
import verticalMenuLogo from "../assets/logos/LadyBeatriceFashionsLogo.png";
import apparelProLogo from "../assets/logos/LingerieLogo.png";
import { navbarData } from "../data/nav-data";

import {
  asideMenuTitleTypographyTheme,
  asideSubMenuTypographyTheme,
  theme,
} from "../themes/themes";
import Menu from "./menu.component";
import Login from "./login.component";
import PinnedMenu from "./pinned-menu.component";

const handleMouseEnter = () => {
  const ele = document.getElementById("show-mobileMenu");
  if (ele) {
    ele.style.left = "0px";
    ele.style.width = "17%";
  }
};

const handleMouseLeave = () => {
  const ele = document.getElementById("show-mobileMenu");
  if (ele) {
    ele.style.width = "150px";
    ele.style.left = "-140px";
  }
};

const Header = () => {
  const [open, setOpen] = useState(0);
  const [pinnedMenuOn, setPinnedMenuOn] = useState(false);

  useEffect(() => {
    const ele = document.getElementById("show-mobileMenu");
    if (ele) {
      ele.style.width = "150px";
      ele.style.left = "-140px";
      ele.hidden = pinnedMenuOn;
    }
    const elePinned = document.getElementById("show-pinnedMenu");
    console.log("pinned Menu :", pinnedMenuOn);
    if (elePinned) {
      if (pinnedMenuOn) {
        elePinned.style.width = "80px";
        elePinned.style.left = "0px"; // 🚀 Snaps perfectly to the absolute 0px left window edge!
      } else {
        elePinned.style.width = "0px";
      }
    }
  }, [pinnedMenuOn]);

  let counter = 0;

  const handleChange = (event: React.SyntheticEvent) => {
    let passValue = 0;

    const textContent = (event.target as HTMLElement).textContent;
    switch (textContent) {
      case "General":
        passValue = 1;
        break;
      case "Order Management Reference":
        passValue = 2;
        break;
      case "Order Management":
        passValue = 3;
        break;
      case "General Inventory":
        passValue = 4;
        break;
      case "Order Wise Inventory":
        passValue = 5;
        break;
      case "Production Control":
        passValue = 6;
        break;
      case "Reports":
        passValue = 7;
        break;
    }
    if (open === passValue) {
      setOpen(0);
    } else {
      setOpen(passValue);
    }
  };

  return (
    <>
      <div className="flex w-full overflow-hidden h-full">
        <div className="flex w-full">
          <div className="container flex-wrap w-full flex 1 1 100% mx1-5">
            <div className="w-full flex justify-around h1-[10%]">
              {/* header logo */}
              <div className="flex w-[80%] m-auto ">
                <Link to={"/"}>
                  <img
                    src={verticalMenuLogo}
                    alt="Apparel Prologo"
                    className="w-[17%] h1-auto m1-auto m1-5"
                  />
                </Link>
              </div>

              {/* login */}

              <div className="flex flex-col justify-around w-[10%] m-auto align-middle">
                <div className="flex justify-end align-middle">
                  <Login />
                </div>
              </div>

              {/* pinned menu */}
              <div className="flex flex-col justify-around w-[10%] m-auto align-middle">
                <div className="flex justify-end align-middle">
                  <PinnedMenu onToggle={setPinnedMenuOn} />
                </div>
              </div>
            </div>

            {/* mobile width <= 767px
            tablet width >= 768px
            laptop width >= 1024px
            */}
            {/* https://www.joshwcomeau.com/animation/keyframe-animations/ */}

            {/* vertical menu */}
            <div id="vertical-menu" className="w-0 h-0 z-50 relative">
              <nav className="flex flex-col flex-1">
                <div
                  className="flex flex-col items-center 
                             w-120 text-sm rounded-md 
                             bg-blue-400 font-semibold border-2 
                             border-gray-500 p-2 
                             fixed top-2 bottom-2 -left-35 z-50 
                             transition-all duration-300 ease-in-out"
                  id="show-mobileMenu"
                  onMouseEnter={() => handleMouseEnter()}
                  onMouseLeave={() => handleMouseLeave()}
                >
                  <img
                    src={apparelProLogo}
                    alt="Apparel Pro logo"
                    className="m-auto justify-center top-0 px-0.5 p-0.3 rounded-md my-0"

                    // style={{
                    //   transform: `rotate(${rotation}deg)`,
                    //   transition: "transform 0.5s ease",
                    // }}
                  />

                  <div className="w-full px-2 overflow-hidden p-4">
                    <ThemeProvider theme={theme}>
                      <Card
                        className="my-auto h-[calc(100vh-9rem)] w-full shadow-xl"
                        id="main-menu"
                      >
                        <div className="text-center my-3">
                          <ThemeProvider theme={asideMenuTitleTypographyTheme}>
                            <Typography
                              // variant="h6"
                              color="black"
                            >
                              Apparel Pro
                            </Typography>
                          </ThemeProvider>
                        </div>

                        <Box
                          sx={{
                            padding: 0,
                            display: "flex",
                            justifyContent: "center",
                            margin: "0 0 5rem 0",
                          }}
                          className="h-[calc(100vh-11.5rem)]"
                        >
                          <List
                            className="w-[96%] bg-[#9e9e9e] overflow-y-scroll scrollbar-none 
                                       h-[calc(100vh-12.5rem)] rounded-md shadow-xl 
                                     shadow-gray-900 border border-gray-700"
                          >
                            {navbarData.map((menu) => {
                              counter++;

                              return (
                                <Accordion
                                  expanded={open === counter}
                                  onChange={(event) => handleChange(event)}
                                  key={menu.label}
                                  style={{
                                    backgroundColor: "#9e9e9e",
                                    margin: "0px",
                                    paddingLeft: "3px",
                                    paddingRight: "3px",
                                    paddingTop: "3px",
                                    paddingBottom: "3px",
                                    boxShadow:
                                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(128, 128,128, 0.08)",
                                    border: "4x solid #000",
                                  }}
                                >
                                  <ListItem
                                    className="p-0 duration-150 transition-[400ms] border-2 border-gray-600 flex justify-around"
                                    id={counter.toString()}
                                    style={{
                                      backgroundColor: "black",
                                      margin: 0,
                                      borderRadius: "8px",
                                      border: "2px solid #fff",
                                      height: "40px",
                                      marginBottom: "2px",
                                      padding: "0",
                                    }}
                                  >
                                    {
                                      // <Button
                                      //   onClick={(event) => {
                                      //     console.log("clicked");
                                      //     handleChange(event);
                                      //   }}
                                      // >
                                      <MenuIcon
                                        name={menu.label}

                                        // onClick={(
                                        //   event: React.MouseEvent<HTMLDivElement>,
                                        // ) => handleChange(event)}
                                      />
                                      // </Button>
                                    }
                                    {/* <AddCircleOutline className="text-blue-400" /> */}

                                    <AccordionSummary
                                      expandIcon={
                                        <ExpandMoreOutlined
                                          htmlColor="#9e9e9e"
                                          style={{
                                            margin: "0px",
                                            height: "26px",
                                            width: "26px",
                                            border: "5px solid #000",
                                          }}
                                          className="w-full"
                                        />
                                      }
                                    >
                                      <ThemeProvider
                                        theme={asideSubMenuTypographyTheme}
                                      >
                                        <Typography>{menu.label}</Typography>
                                      </ThemeProvider>
                                    </AccordionSummary>
                                  </ListItem>

                                  <AccordionDetails className="rounded-md shadow-xl shadow-gray-900 border border-gray-700 m-2">
                                    <List className="p-0">
                                      {menu.subMenus &&
                                        menu.subMenus.map((subMenu) => {
                                          return (
                                            <ListItem
                                              className="m-0 h1-[3em] h-auto w-auto rounded-md my-2"
                                              key={subMenu.label}
                                            >
                                              <ul className="h-full w-full m-0 p-0">
                                                <Menu
                                                  subMenus={null}
                                                  label={subMenu.label}
                                                  icon=""
                                                  routerLink={
                                                    subMenu.routerLink
                                                  }
                                                  key={subMenu.label}
                                                />
                                              </ul>
                                            </ListItem>
                                          );
                                        })}
                                    </List>
                                  </AccordionDetails>
                                </Accordion>
                              );
                            })}
                            <Box
                              sx={{
                                margin: "auto",
                                padding: 0,
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <List className="flex justify-around bg-[#9e9e9e] h-[3.5em] w-[95%]">
                                <ListItem
                                  className="text-[#60a5fa] flex justify-around h-full bg-black hover:text-white 
                                                      rounded-md border-2 border-white px-4"
                                >
                                  <div className="flex justify-end px-2 w-[25%]">
                                    <HowToRegOutlinedIcon className="flex w-full justify-start" />
                                  </div>
                                  <Link
                                    to={"/sign-up"}
                                    className="ml-5 w-[75%] text-sm"
                                  >
                                    Signup
                                  </Link>
                                </ListItem>
                              </List>
                            </Box>
                          </List>
                        </Box>
                      </Card>
                    </ThemeProvider>
                  </div>

                  <div className="text-sm font-bold text-center">
                    <span className="text-sm font-semibold text-center mt-2">
                      We redefine fashions
                    </span>
                  </div>
                </div>
              </nav>
            </div>
            {/* end of vertical menu  */}

            {/* pinned menu */}

            {/* 🚀 FIXED: Pinned Menu Layout Container */}
            <div
              id="show-pinnedMenu"
              className="fixed top-2 bottom-2 left-0 z-50 transition-all duration-300 ease-in-out"
              style={{ width: "80px", left: "0px" }} // Initial width set to match your script variables
            >
              <ThemeProvider theme={theme}>
                <Card
                  className="my-auto h-[calc(100vh-1rem)] shadow-xl border border-gray-300"
                  id="main-pinned-menu"
                  style={{ margin: 0, height: "100%" }} // Forces full vertical card expansion
                >
                  <Box
                    sx={{
                      padding: 0,
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "0.5rem",
                    }}
                    className="h-full"
                  >
                    <List
                      className="w-[85%] bg-black overflow-y-scroll scrollbar-none 
                     h-[calc(100vh-2rem)] rounded-md shadow-xl shadow-gray-900 
                     border border-gray-700 p-2 flex flex-col items-center gap-2"
                    >
                      {navbarData.map((menu) => {
                        return menu.subMenus?.map((sm) => {
                          if (sm.pinned) {
                            return (
                              <li
                                key={sm.label}
                                className="flex justify-center hover:bg-gray-800 rounded-md transition-colors duration-150"
                              >
                                <Link
                                  to={sm.routerLink}
                                  className="flex p-2 hover:border border-gray-200 rounded-sm hover:text-black"
                                  title={sm.label} // Native tooltip text on hover
                                >
                                  <MenuIcon name={sm.label} />
                                </Link>
                              </li>
                            );
                          }
                          return null;
                        });
                      })}
                    </List>
                  </Box>
                </Card>
              </ThemeProvider>
            </div>
            {/* end of pinned menu */}

            <div id="show-pinnedMenu-1" className="w-0 h-0 z-50 relative">
              <ThemeProvider theme={theme}>
                <Card
                  className="my-auto h-[calc(100vh-9rem)] shadow-xl z-60"
                  id="main-menu"
                >
                  <Box
                    sx={{
                      padding: 0,
                      display: "flex",
                      justifyContent: "center",
                      margin: "0.2rem",
                      border: "1rem",
                    }}
                    className="h-[calc(100vh)]"
                  >
                    <List
                      className="w1-[96%] bg1-[#9e9e9e] bg-black overflow-y-scroll scrollbar-none w-16
                            h-[calc(100vh-9.5rem)] rounded-md shadow-xl shadow-gray-900 
                            border border-gray-700 p-3"
                    >
                      {navbarData.map((menu) => {
                        counter++;

                        {
                          return menu.subMenus.map((sm) => {
                            if (sm.pinned) {
                              return (
                                <li
                                  className="flex justify-around w-[95%] hover:text-white"
                                  key={sm.label}
                                >
                                  <Link
                                    to={sm.routerLink}
                                    className="flex mx-auto p-2 hover:text-white"
                                  >
                                    <MenuIcon name={sm.label} />
                                  </Link>
                                </li>
                              );
                            }
                          });
                        }
                      })}
                    </List>
                  </Box>
                </Card>
              </ThemeProvider>
            </div>

            {/* end of pinned menu */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
