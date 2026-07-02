import { createTheme } from "@mui/material";

const asideMenuTitleTypographyTheme = createTheme({
  typography: {
    fontSize: 20,
    // fontWeightMedium: 600,
    h6: {
      fontWeight: 600,
    },

    // "letterSpacing": 0.32,
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          letterSpacing: "0.7em",
          fontWeight: 600,
          // shadow: "0 4px 6px rgba(255, 255, 255, 0.9)",
        },
      },
    },
  },
});

const sloganTypographyTheme = createTheme({
  // typography: {
  //   fontSize: 14,
  //   // fontWeightMedium: 600,
  //   h6: {
  //     fontWeight: 600,
  //   },

  //   // "letterSpacing": 0.32,
  // },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          letterSpacing: "0.1em",
          fontWeight: 300,
          shadow: "0 4px 6px rgba(255, 255, 255, 0.9)",
          textSize: "0.3rem",
        },
      },
    },
  },
});

const formHeaderTitleTypographyTheme = createTheme({
  // typography: {
  //   fontSize: 14,
  //   // fontWeightMedium: 600,
  //   h6: {
  //     fontWeight: 600,
  //   },

  //   // "letterSpacing": 0.32,
  // },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          letterSpacing: "0.7em",
          fontWeight: 600,
          borderRadius: 5,
          // backgroundColor: "#fff",
          backgroundColor: "#DCDCDC",
        },
      },
    },
  },
});

const formErrorMessageDisplayTypographyTheme = createTheme({
  // typography: {
  //   fontSize: 14,
  //   // fontWeightMedium: 600,
  //   h6: {
  //     fontWeight: 600,
  //   },

  //   // "letterSpacing": 0.32,
  // },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 5,
          color: "#FF0000",
        },
      },
    },
  },
});

const asideSubMenuTypographyTheme = createTheme({
  // typography: {
  //   fontSize: 14,
  //   // fontWeightMedium: 600,
  //   h6: {
  //     fontWeight: 600,
  //   },

  //   // "letterSpacing": 0.32,
  // },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: "11px",
          // variants: "h6",
          color: "#42a5f5",
          fontWeight: 600,
          textAlign: "center",
          margin: "auto",
          padding: "auto",
          ":hover": {
            color: "#fff",
            fontWeight: "500",
          },
        },
      },
    },
  },
});

declare module "@mui/material/styles" {
  interface Palette {
    custom: Palette["primary"];
  }

  interface PaletteOptions {
    custom?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface PaginationPropsColorOverrides {
    custom: true;
  }
}

declare module "@mui/material/styles" {
  interface Palette {
    salmon: Palette["primary"];
  }

  interface PaletteOptions {
    salmon?: PaletteOptions["primary"];
  }
}

// Update the Button's color options to include a salmon option
declare module "@mui/material/Button" {
  interface PaginationPropsColorOverrides {
    salmon: true;
  }
}

// let theme = createTheme({
//   // Theme customization goes here as usual, including tonalOffset and/or
//   // contrastThreshold as the augmentColor() function relies on these
// });

// theme = createTheme(theme, {
//   // Custom colors created with augmentColor go here
//   palette: {
//     salmon: theme.palette.augmentColor({
//       color: {
//         main: "#FF5733",
//       },
//       name: "salmon",
//     }),
//   },
// });

const blueTheme = createTheme({
  palette: {
    primary: {
      main: "#42a5f5",
      light: "#808080",
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: "#42a5f5",
      light: "#F5EBFF",
      // dark: will be calculated from palette.secondary.main,
      contrastText: "#47008F",
    },
  },
});

const yellowTheme = createTheme({
  palette: {
    primary: {
      main: "#E3D026",
      light: "#E9DB5D",
      dark: "#A29415",
      contrastText: "#242105",
    },
  },
});

// const theme = createTheme({
//   components: {
//     // Name of the component
//     MuiButton: {
//       styleOverrides: {
//         // Name of the slot
//         root: {
//           // Some CSS
//           fontSize: "1rem",
//         },
//       },
//     },
//   },
// });

// const theme = createTheme({
//   palette: {
//     tomato: "#FF6347",
//     pink: {
//       deep: "#FF1493",
//       hot: "#FF69B4",
//     },
//   },
// });

const theme = createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          background: "#9e9e9e",
          borderRadius: "10px",
          boxShadow:
            " 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); ",
        },
      },
    },
  },
});

export {
  asideMenuTitleTypographyTheme,
  asideSubMenuTypographyTheme,
  formHeaderTitleTypographyTheme,
  formErrorMessageDisplayTypographyTheme,
  sloganTypographyTheme,
  blueTheme,
  yellowTheme,
  theme,
};
