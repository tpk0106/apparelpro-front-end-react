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
    mode: "dark",
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
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif' },
    h2: { fontFamily: '"Space Grotesk", sans-serif' },
    h6: { fontFamily: '"Space Grotesk", sans-serif' },
    button: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      textTransform: "none",
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

const apparelProDarkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0A0E14", // Primary canvas background surface mapping
      paper: "#141922", // Cards, Modals, Toolbars panel structures
    },
    text: {
      primary: "#000000", // Primary text fields and labeling lines
      secondary: "#8B93A1", // Muted parameters, placeholder markers
    },
    primary: {
      main: "#60a5fa", // Primary interactive buttons actions
      light: "#818CF8", // Glow boundaries on input focused windows
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif' },
    h2: { fontFamily: '"Space Grotesk", sans-serif' },
    h6: { fontFamily: '"Space Grotesk", sans-serif' },
    button: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      textTransform: "none",
    },
  },
  components: {
    // 1. GLOBAL FIX: Force every single dropdown popover menu (Page Sizing, Show/Hide Columns, Filters)
    // to render with a solid background and high-visibility text across the entire application
    MuiMenu: {
      defaultProps: {
        slotProps: {
          paper: {
            sx: {
              backgroundColor: "#141922 !important", // Solid deep slate card background surface
              backgroundImage: "none !important",
              opacity: "1 !important", // 🚀 FIXED: Completely kill all transparent blending bugs
              border: "1px solid rgba(139, 147, 161, 0.2) !important",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.8) !important",

              // Target listing items inside the popover windows natively
              "& .MuiMenuItem-root": {
                color: "#F4F6F8 !important", // Crisp white text items
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.8rem",
                "& .MuiSvgIcon-root": {
                  color: "#60a5fa !important", // Column checklist icons turn sky blue
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08) !important",
                },
                "&.Mui-selected": {
                  backgroundColor: "#60a5fa !important", // Selected active item background turns sky blue
                  color: "#000000 !important", // Text colors flip to dark ink for readability
                  "& .MuiSvgIcon-root": {
                    color: "#000000 !important",
                  },
                },
              },
              // Fix for lists and form checkboxes inside Column Show/Hide layouts
              "& .MuiTypography-root, & .MuiCheckbox-root": {
                color: "#F4F6F8 !important",
              },
              "& .MuiCheckbox-root.Mui-checked .MuiSvgIcon-root": {
                color: "#60a5fa !important",
              },
            },
          },
        },
      },
    },
    // 1. Fix the floating dropdown box layout globally
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: "#0D1117", // Softer deep dark layout canvas surface
          border: "1px solid rgba(139, 147, 161, 0.2)",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.6)",
        },
        listbox: {
          padding: "4px",
          "& .MuiAutocomplete-option": {
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.8rem",
            color: "#F4F6F8", // Force option items text to pure white
            borderRadius: "4px",
            marginPadding: "2px 0",
            // Hover/Highlight selections states configuration
            '&[aria-selected="true"]': {
              backgroundColor: "rgba(99, 102, 241, 0.24) !important",
              color: "#F4F6F8",
            },
            '&.Mui-focused, &[data-focus="true"]': {
              backgroundColor: "rgba(139, 147, 161, 0.12) !important",
              color: "#F4F6F8",
            },
          },
        },
        noOptions: {
          color: "#8B93A1",
          backgroundColor: "#0A0E14",
          fontSize: "0.8rem",
        },
        loading: {
          color: "#8B93A1",
          backgroundColor: "#0A0E14",
          fontSize: "0.8rem",
        },
      },
    },

    // 2. Fix global text field input layouts inside dropdown fields
    MuiTextField: {
      styleOverrides: {
        root: {
          // Form Layout Label Typography Rules
          "& .MuiInputLabel-root": {
            color: "#8B93A1", // Default muted label text color when inactive
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: "0.85rem",

            // Fix the Floating Frame Label State Visibility (Shrunk onto border)
            "&.MuiInputLabel-shrink": {
              color: "#005B96", // Polished subtle indigo text color for selected/active states
              fontWeight: "600",
              paddingX: "6px", // Clear visual padding to push the frame line away from text
              borderRadius: "2px",
              marginLeft: "-2px",
            },
            "&.Mui-focused": {
              color: "#6366F1", // Deep rich indigo accent when actively focused
            },
          },

          // Softer Dark Surface Input Field Container Mapping
          "& .MuiOutlinedInput-root": {
            borderRadius: "6px",
            color: "#141922", // Crisp primary text entry color
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.8rem",

            // Border boundary rule parameters
            "& fieldset": {
              borderColor: "rgba(139, 147, 161, 0.25)",
            },
            "&:hover fieldset": {
              borderColor: "#377DF6", // Softer focus hover boundary line
            },
            "&.Mui-focused fieldset": {
              borderColor: "#6366F1", // Primary brand action boundary
              borderWidth: "1.5px",
            },

            // Autocomplete icon toggle triggers adjustment
            "& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator":
              {
                color: "#8B93A1",
                "&:hover": { color: "#F4F6F8" },
              },
          },
        },
      },
    },

    // --- MATERIAL REACT TABLE GLOBAL COMPONENTS OVERRIDES ---

    // 1. Manage Table Layout Container & Body Backgrounds
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#0A0E14",
          "& .MuiTableBody-root": {
            backgroundColor: "#0A0E14",
          },
        },
      },
    },

    // 2. Global Row and Row-Editing State Controls
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "all 0.15s ease-in-out",

          // 1. EVEN ROWS: Default Blue layout background
          "&:nth-of-type(even)": {
            backgroundColor: "#4B9CD3 !important",
          },

          // 2. ODD ROWS: Default Light Blue layout background
          "&:nth-of-type(odd)": {
            backgroundColor: "#7CB9E8 !important",
          },

          // Universal cell text rules for standard display rows
          "& td": {
            color: "#000000 !important",
            borderColor: "rgba(0, 0, 0, 0.1) !important",
          },

          // Force all standard table view icons to be constant blue/indigo
          "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root":
            {
              // color: "#4169E1 !important",
              color: "#4169E1 !important", // SkyBlue
            },

          // 3. ACTIVE EDIT MODE ROW OVERRIDES: White canvas background
          "&.Mui-editingRow, &[data-editing='true']": {
            backgroundColor: "#FFFFFF !important",
            "& td": {
              color: "#000000 !important",
            },
            "& .MuiInputBase-root, & .MuiOutlinedInput-input": {
              color: "#000000 !important",
              backgroundColor: "#F4F6F8 !important",
            },
            "& .MuiInputLabel-root": {
              color: "#495057 !important",
            },
            // Keep active form actions anchored to the exact same blue style
            "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root":
              {
                color: "#4169E1 !important",
              },
            // Prevent color shifting if a user hovers an item while editing it
            "&:hover": {
              backgroundColor: "#FFFFFF !important",
              "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root":
                {
                  color: "#4169E1 !important",
                },
            },
          },

          // 4. DATA ROW HOVER STATE OVERRIDES: Slate dark row hover pop
          // 🚀 THE FIX: Target only '.MuiTableBodyRow-root' to protect headers and footers from turning black on hover
          "&.MuiTableBodyRow-root:hover": {
            backgroundColor: "#141922 !important",
            "& td": {
              //  color: "#F4F6F8 !important",
              color: "##4169E1 !important",
            },
            "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root":
              {
                color: "#4169E1 !important", // Pinned to the identical matching color
              },
            "& .MuiIconButton-root:hover": {
              backgroundColor: "rgba(99, 102, 241, 0.12) !important",
            },
          },
        },
      },
    },

    // 3. Global Cell Overrides & Action Icon Controls
    MuiTableCell: {
      styleOverrides: {
        // Main Cell Configurations
        body: {
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.75rem",
          color: "#8B93A1",
          borderBottom: "1px solid rgba(139, 147, 161, 0.08)",
          padding: "10px 16px",

          // Force alignment metrics numbers to use mono-spacing
          '&[data-numeric="true"], &:has(span[class*="numeric"])': {
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: "-0.02em",
          },
        },

        // Table Header Configurations
        head: {
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: "0.85rem",
          fontWeight: "600",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          //backgroundColor: "#141922",
          backgroundColor: "#60a5fa",
          color: "#F4F6F8",
          borderBottom: "2px solid rgba(99, 102, 241, 0.3)",
          padding: "14px 16px",
        },

        // Table Summary Footer Configurations
        footer: {
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: "600",
          // backgroundColor: "#141922",
          backgroundColor: "#60a5fa",
          // color: "#6366F1",
          color: "#60a5fa",
          borderTop: "1px solid rgba(139, 147, 161, 0.2)",
          boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.4)",
        },
      },
    },

    // 🚀 GLOBAL TOP TOOLBAR & PAGINATION OVERRIDES
    // Directly targets the core paper wrappers and internal grid toolbar components built into Material React Table
    MuiToolbar: {
      styleOverrides: {
        root: {
          // 1. TARGET THE TOP TOOLBAR: Match the exact layout selectors used internally by MRT
          '&.MuiToolbar-gutters, &:has(div[class*="MuiCollapse"]), &:has(button[aria-label*="Toggle"])':
            {
              backgroundColor: "#60a5fa !important", // Fixed Sky Blue configuration
              boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.5) !important", // Deep shadow depth overlay projection
              borderBottom: "none !important",
              backgroundImage: "none !important", // Clear out default dark paper layer overrides

              // Ensure any interactive action icons inside the sky blue toolbar contrast well
              "& .MuiIconButton-root, & .MuiSvgIcon-root": {
                color: "#000000 !important", // Set actions inside toolbar to crisp black visibility
              },
              "& .MuiInputBase-input": {
                color: "#000000 !important", // Ensure global lookup fields inputs text is readable
              },
            },

          // 2. TARGET THE BOTTOM TOOLBAR: Clean separation wrapper mapping
          "&.MuiTablePagination-toolbar": {
            backgroundColor: "#141922 !important", // Grounding footer elegantly back into your custom dark panel slate
            color: "#F4F6F8 !important", // White text pagination readouts
            borderTop: "1px solid rgba(139, 147, 161, 0.15) !important",

            "& .MuiIconButton-root": {
              color: "#6366F1 !important", // Pinned navigation arrows to blue/indigo theme layout range
            },
          },
        },
      },
    },

    // // 4. GLOBAL TOP TOOLBAR & PAGINATION OVERRIDES
    // MuiToolbar: {
    //   styleOverrides: {
    //     root: {
    //       // Targets Material React Table specific top header toolbars natively
    //       "&:has(.MuiCollapse-root)": {
    //         // backgroundColor: "rgb(96 165 250) !important", // Your bright blue theme signature
    //         backgroundColor: "#60a5fa !important", // Your bright blue theme signature
    //         boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.5) !important", // Clear depth shadow projection
    //         borderBottom: "none !important",
    //       },
    //       // Targets the bottom pagination toolbar to keep it clean and matching
    //       "&.MuiTablePagination-toolbar": {
    //         //backgroundColor: "#141922", // Keeps footer dark as configured in your layout
    //         backgroundColor: "#60a5fa", // Keeps footer dark as configured in your layout
    //         borderTop: "1px solid rgba(139, 147, 161, 0.15)",
    //       },
    //     },
    //   },
    // },
  },
});

export {
  apparelProDarkTheme,
  asideMenuTitleTypographyTheme,
  asideSubMenuTypographyTheme,
  formHeaderTitleTypographyTheme,
  formErrorMessageDisplayTypographyTheme,
  sloganTypographyTheme,
  blueTheme,
  yellowTheme,
  theme,
};

// const apparelProDarkTheme1 = createTheme({
//   palette: {
//     mode: "dark",
//     background: {
//       default: "#0A0E14", // Primary canvas background surface mapping
//       paper: "#141922", // Cards, Modals, Toolbars panel structures
//     },
//     text: {
//       primary: "#000000", // Primary text fields and labeling lines
//       // primary: "#F4F6F8", // Primary text fields and labeling lines
//       secondary: "#8B93A1", // Muted parameters, placeholder markers
//     },
//     primary: {
//       // main: "#6366F1", // Primary interactive buttons actions
//       main: "#60a5fa", // Primary interactive buttons actions
//       light: "#818CF8", // Glow boundaries on input focused windows
//     },
//   },
//   typography: {
//     fontFamily: '"Inter", sans-serif',
//     h1: { fontFamily: '"Space Grotesk", sans-serif' },
//     h2: { fontFamily: '"Space Grotesk", sans-serif' },
//     h6: { fontFamily: '"Space Grotesk", sans-serif' },
//     button: {
//       fontFamily: '"Space Grotesk", sans-serif',
//       fontWeight: 600,
//       textTransform: "none",
//     },
//   },
//   components: {
//     // 1. Fix the floating dropdown box layout globally
//     MuiAutocomplete: {
//       styleOverrides: {
//         paper: {
//           backgroundColor: "#0D1117", // Match the new softer base tone
//           border: "1px solid rgba(139, 147, 161, 0.2)",
//           boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.6)",
//           // backgroundColor: "#0A0E14", // Force dropdown background to absolute black
//           // border: "1px solid rgba(139, 147, 161, 0.2)", // Add clear boundary lines
//           // boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.6)",
//         },
//         listbox: {
//           padding: "4px",
//           "& .MuiAutocomplete-option": {
//             fontFamily: '"Inter", sans-serif',
//             fontSize: "0.8rem",
//             color: "#F4F6F8", // Force option items text to pure white
//             borderRadius: "4px",
//             marginPadding: "2px 0",
//             // Hover/Highlight selections states configuration
//             '&[aria-selected="true"]': {
//               backgroundColor: "rgba(99, 102, 241, 0.24) !important",
//               color: "#F4F6F8",
//             },
//             '&.Mui-focused, &[data-focus="true"]': {
//               backgroundColor: "rgba(139, 147, 161, 0.12) !important",
//               color: "#F4F6F8",
//             },
//           },
//         },
//         noOptions: {
//           color: "#8B93A1",
//           backgroundColor: "#0A0E14",
//           fontSize: "0.8rem",
//         },
//         loading: {
//           color: "#8B93A1",
//           backgroundColor: "#0A0E14",
//           fontSize: "0.8rem",
//         },
//       },
//     },
//     // 2. Fix global text field input layouts inside dropdown fields
//     MuiTextField: {
//       styleOverrides: {
//         root: {
//           // Form Layout Label Typography Rules
//           "& .MuiInputLabel-root": {
//             color: "#8B93A1", // Default muted label text color when inactive
//             fontFamily: '"Space Grotesk", sans-serif',
//             fontSize: "0.85rem",

//             // Fix the Floating Frame Label State Visibility (Shrunk onto border)
//             "&.MuiInputLabel-shrink": {
//               // color: "#818CF8", // Polished subtle indigo text color for selected/active states
//               color: "#005B96", // Polished subtle indigo text color for selected/active states
//               fontWeight: "600",
//               // backgroundColor: "#0D1117", // Match the input surface color to block the border line
//               // backgroundColor: "#ffffff", // Match the input surface color to block the border line
//               paddingX: "6px", // Clear visual padding to push the frame line away from text
//               borderRadius: "2px",
//               marginLeft: "-2px",
//             },
//             "&.Mui-focused": {
//               color: "#6366F1", // Deep rich indigo accent when actively focused
//             },
//           },

//           // Softer Dark Surface Input Field Container Mapping
//           "& .MuiOutlinedInput-root": {
//             borderRadius: "6px",
//             // backgroundColor: "#0D1117", // Softer, premium look closer to black
//             //color: "#F4F6F8", // Crisp primary text entry color
//             color: "#141922", // Crisp primary text entry color
//             fontFamily: '"Inter", sans-serif',
//             fontSize: "0.8rem",

//             // Border boundary rule parameters
//             "& fieldset": {
//               borderColor: "rgba(139, 147, 161, 0.25)",
//             },
//             "&:hover fieldset": {
//               // borderColor: "#818CF8", // Softer focus hover boundary line
//               borderColor: "#377DF6", // Softer focus hover boundary line
//             },
//             "&.Mui-focused fieldset": {
//               borderColor: "#6366F1", // Primary brand action boundary
//               borderWidth: "1.5px",
//             },

//             // Autocomplete icon toggle triggers adjustment
//             "& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator":
//               {
//                 color: "#8B93A1",
//                 "&:hover": { color: "#F4F6F8" },
//               },
//           },
//         },
//       },
//     },

//     // --- MATERIAL REACT TABLE GLOBAL COMPONENTS OVERRIDES ---

//     // 1. Manage Table Layout Container & Body Backgrounds
//     MuiTable: {
//       styleOverrides: {
//         root: {
//           backgroundColor: "#0A0E14",
//           "& .MuiTableBody-root": {
//             backgroundColor: "#0A0E14",
//           },
//         },
//       },
//     },

//     // 2. Global Row and Row-Editing State Controls
//     MuiTableRow: {
//       styleOverrides: {
//         root: {
//           transition: "all 0.15s ease-in-out",

//           // 1. EVEN ROWS: Default Blue layout background
//           "&:nth-of-type(even)": {
//             backgroundColor: "#4B9CD3 !important",
//           },

//           // 2. ODD ROWS: Default Light Blue layout background
//           "&:nth-of-type(odd)": {
//             backgroundColor: "#7CB9E8 !important",
//           },

//           // Universal cell text rules for standard display rows
//           "& td": {
//             color: "#000000 !important",
//             borderColor: "rgba(0, 0, 0, 0.1) !important",
//           },

//           // 🚀 THE PURPLE LOCK FIX (DISPLAY MODE): Force all table view icons to be constant purple
//           "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root":
//             {
//               // color: "#A855F7 !important", // Vibrant premium purple
//               color: "#4169E1 !important", // Vibrant premium purple
//               // color: "#006B3C !important", // Vibrant premium purple
//             },

//           // 3. ACTIVE EDIT MODE ROW OVERRIDES: White canvas background
//           '&.Mui-editingRow, &[data-editing="true"]': {
//             backgroundColor: "#FFFFFF !important",
//             "& td": {
//               color: "#000000 !important",
//             },
//             "& .MuiInputBase-root, & .MuiOutlinedInput-input": {
//               color: "#000000 !important",
//               backgroundColor: "#F4F6F8 !important",
//             },
//             "& .MuiInputLabel-root": {
//               color: "#495057 !important",
//             },
//             // Keep active form actions anchored to the exact same purple style
//             "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root":
//               {
//                 // color: "#A855F7 !important",
//                 color: "#4169E1 !important",
//               },
//             // Prevent color shifting if a user hovers an item while editing it
//             "&:hover": {
//               backgroundColor: "#FFFFFF !important",
//               "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root":
//                 {
//                   color: "#4169E1 !important",
//                 },
//             },
//           },

//           // 4. ROW HOVER STATE OVERRIDES: Slate dark row hover pop
//           // 🚀 THE PURPLE LOCK FIX (HOVER MODE): Keep icons pinned to the exact same purple on hover
//           "&:hover": {
//             backgroundColor: "#141922 !important",
//             "& td": {
//               color: "#F4F6F8 !important",
//             },
//             "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root":
//               {
//                 // color: "#A855F7 !important", // Pinned to the identical matching purple color
//                 color: "#4169E1 !important", // Pinned to the identical matching purple color
//               },
//             "& .MuiIconButton-root:hover": {
//               backgroundColor: "rgba(168, 85, 247, 0.12) !important", // Subtle glowing purple backdrop
//             },
//           },
//         },
//       },
//     },

//     // 3. Global Cell Overrides & Action Icon Controls
//     MuiTableCell: {
//       styleOverrides: {
//         // Main Cell Configurations
//         body: {
//           fontFamily: '"Inter", sans-serif',
//           fontSize: "0.75rem",
//           color: "#8B93A1",
//           borderBottom: "1px solid rgba(139, 147, 161, 0.08)",
//           padding: "10px 16px",

//           // Force alignment metrics numbers to use mono-spacing
//           '&[data-numeric="true"], &:has(span[class*="numeric"])': {
//             fontFamily: '"JetBrains Mono", monospace',
//             letterSpacing: "-0.02em",
//           },

//           // 🚀 FIX #1 & #2: Action Icons Color Mapping (Edit, Save, Cancel)
//           // Forces all action cell edit/save icon buttons to display in your blue theme color by default
//           "& .MuiIconButton-root": {
//             color: "#6366F1 !important", // Display and edit actions set to your primary blue/indigo accent
//             "&:hover": {
//               backgroundColor: "rgba(99, 102, 241, 0.08)",
//             },
//           },
//         },

//         // Table Header Configurations
//         head: {
//           fontFamily: '"Space Grotesk", sans-serif',
//           fontSize: "0.85rem",
//           fontWeight: "600",
//           letterSpacing: "0.03em",
//           textTransform: "uppercase",
//           backgroundColor: "#141922",
//           color: "#F4F6F8",
//           borderBottom: "2px solid rgba(99, 102, 241, 0.3)",
//           padding: "14px 16px",
//         },

//         // Table Summary Footer Configurations
//         footer: {
//           fontFamily: '"Space Grotesk", sans-serif',
//           fontWeight: "600",
//           backgroundColor: "#141922",
//           color: "#6366F1",
//           borderTop: "1px solid rgba(139, 147, 161, 0.2)",
//           boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.4)",
//         },
//       },
//     },

//     // 4. Global Top and Bottom Grid Toolbar Containers
//     // MuiToolbar: {
//     //   styleOverrides: {
//     //     root: {
//     //       // Targets Material React Table specific header toolbars
//     //       "&:has(.MuiCollapse-root), &.MuiTablePagination-toolbar": {
//     //         // backgroundColor: "#141922",
//     //         backgroundColor: "#60a5fa",
//     //         borderBottom: "1px solid rgba(139, 147, 161, 0.15)",
//     //       },
//     //     },
//     //   },
//     // },

//     // 🚀 GLOBAL TOP TOOLBAR & PAGINATION OVERRIDES
//     MuiToolbar: {
//       styleOverrides: {
//         root: {
//           // Targets Material React Table specific top header toolbars natively
//           "&:has(.MuiCollapse-root)": {
//             backgroundColor: "rgb(96, 165, 250) !important", // Your bright blue theme signature
//             boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.5) !important", // Clear depth shadow projection
//             borderBottom: "none !important",
//           },
//           // Targets the bottom pagination toolbar to keep it clean and matching
//           "&.MuiTablePagination-toolbar": {
//             // backgroundColor: "#141922", // Keeps footer dark as configured in your layout
//             backgroundColor: "#60a5fa", // Keeps footer dark as configured in your layout
//             borderTop: "1px solid rgba(139, 147, 161, 0.15)",
//           },
//         },
//       },
//     },
//   },
// });
