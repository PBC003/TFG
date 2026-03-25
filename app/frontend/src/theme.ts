import { alpha, createTheme } from "@mui/material/styles";

const primaryMain = "#1F3A5F";
const primaryDark = "#152A45";
const accentMain = "#F59E0B";
const accentDark = "#D97706";
const accentSoft = "#FFF4DE";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: primaryMain,
      dark: primaryDark,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: accentMain,
      light: accentSoft,
      dark: accentDark,
      contrastText: "#0F172A",
    },
    background: {
      default: "#F7F8FC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#475569",
    },
    divider: "#E2E8F0",
    success: {
      main: "#2E7D32",
    },
    warning: {
      main: accentMain,
    },
    error: {
      main: "#D14343",
    },
  },
  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },
    h2: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },
    h3: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "linear-gradient(180deg, #f7f8fc 0%, #eef3fb 48%, #f7f8fc 100%)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: primaryMain,
          color: "#FFFFFF",
          boxShadow: "none",
          borderBottom: `1px solid ${alpha("#FFFFFF", 0.1)}`,
          backgroundImage: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 58%, #27486f 100%)`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: "1px solid #E2E8F0",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 18,
          paddingBlock: 10,
        },
        containedPrimary: {
          backgroundImage: `linear-gradient(135deg, ${accentMain} 0%, #f6ad24 100%)`,
          color: "#0F172A",
          boxShadow: "0 14px 30px rgba(245, 158, 11, 0.24)",
          "&:hover": {
            backgroundImage: `linear-gradient(135deg, ${accentDark} 0%, ${accentMain} 100%)`,
            boxShadow: "0 16px 36px rgba(217, 119, 6, 0.28)",
          },
        },
        outlinedPrimary: {
          borderColor: alpha(primaryMain, 0.18),
          color: primaryMain,
          "&:hover": {
            borderColor: primaryMain,
            backgroundColor: alpha(primaryMain, 0.05),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: "xl",
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          backgroundColor: alpha("#FFFFFF", 0.12),
          border: `1px solid ${alpha("#FFFFFF", 0.18)}`,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: "0",
          borderRadius: 999,
          color: alpha("#FFFFFF", 0.82),
          fontWeight: 700,
          paddingInline: 16,
          "&.Mui-selected": {
            color: primaryDark,
            backgroundColor: "#FFFFFF",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#FFFFFF",
          },
        },
      },
    },
  },
  spacing: 8,
});
