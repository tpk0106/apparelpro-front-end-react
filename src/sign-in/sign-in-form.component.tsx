import { useEffect, useState, type ChangeEvent } from "react";
import { z } from "zod";

import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import type { LoginRequest } from "../interfaces/login/loginRequest";
import { useDispatch, useSelector } from "react-redux";
// import { getCurrentError } from "../sagaStore/user/user.selector";

import { resetSignInState, signInStart } from "../sagaStore/user/user.action";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import OutlinedInput from "@mui/material/OutlinedInput";

import { asideMenuTitleTypographyTheme } from "../themes/themes";
import { useNavigate } from "react-router-dom";
import { USER_CREDENTIALS } from "../interfaces/definitions";
import { getCurrentUser, getIsLoading } from "../sagaStore/user/user.selector";
import { DASHBOARD_COLORS } from "../components/dashboard/dashboard-theme";
import { useDropdownTheme } from "../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../themes/workspace-theme";

const SignInForm = () => {
  const signInForm: LoginRequest = {
    email: "",
    password: "",
  };

  const [signInFormData, setSignInFormData] =
    useState<LoginRequest>(signInForm);
  const [errors, setErrors] = useState<signInFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(
    localStorage.getItem(USER_CREDENTIALS.USER_KEY),
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Inside your actual Sign-In Form Page component (e.g., SignInPage.tsx)
  const currUser = useSelector(getCurrentUser);
  const isLoading = useSelector(getIsLoading);

  useEffect(() => {
    dispatch(resetSignInState());
    return () => {
      dispatch(resetSignInState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currUser) {
      navigate("/"); // Only redirects if they are physically looking at the login form
    }
  }, [currUser, navigate]); // 🧠 Crucial: Dependency array ensures this only checks when user status changes

  // let error = useSelector(getCurrentError);
  //const user = useSelector(getCurrentUser);

  // https://www.reddit.com/r/react/comments/y03qew/useselector_returns_undefined_at_first_render_but/?rdt=63144

  const signInFormSchema = z.object({
    email: z.coerce.string().min(5, "email required"),
    password: z.coerce.string().min(8, "password required"),
  });

  type signInFormData = z.infer<typeof signInFormSchema>;
  type signInFormErrors = Partial<Record<keyof signInFormData, string[]>>;

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // Same olive dropdown/field theme used by Order Confirmation Routine and
  // the Update Profile form, so this form's fields match the rest of the
  // app instead of rendering with default (invisible-on-dark) MUI colors.
  const { fieldSx: dropdownFieldSx } = useDropdownTheme();

  const validateForm = (data: signInFormData): signInFormErrors => {
    try {
      signInFormSchema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Use z.flattenError to extract flat fieldErrors directly
        const flattened = z.flattenError(error);
        return flattened.fieldErrors as signInFormErrors;
      }
      return {};
    }
  };

  const handleSubmit = async (e: any) => {
    console.log("Form Data : ", signInFormData);
    e.preventDefault();
    if (!signInFormData) return;

    const newErrors = validateForm(signInFormData);
    setErrors(newErrors);
    console.log("Raised Errors", errors);
    if (Object.keys(newErrors).length !== 0) {
      return;
    }
    if (Object.keys(newErrors).length === 0) {
      // form is valid proceed !
    }

    try {
      // redux
      console.log("dispatching signInStart with data : ", signInFormData);
      dispatch(signInStart(signInFormData));

      setCurrentUser(localStorage.getItem(USER_CREDENTIALS.USER_KEY));
      // console.log("current User : ", currentUser);

      if (currentUser) {
        // console.log("routing......");
        navigate("/");
      }
    } catch (error: unknown) {
      console.log("An error occurred while submitting the form:", error);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSignInFormData({ ...signInFormData, [name]: value });

    const newErrors = validateForm(signInFormData);
    setErrors(newErrors);
  };

  return (
    <div
      className="flex flex-col justify-center w-full m-auto h1-screen h1-1/2 mx-auto my-auto mt-3"
      style={{ backgroundColor: DASHBOARD_COLORS.pageBg, padding: 24, borderRadius: 8 }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "50%",
          padding: 4,
          backgroundColor: DASHBOARD_COLORS.cardBg,
          border: `1px solid ${DASHBOARD_COLORS.border}`,
          boxShadow: "0 10px 28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.3)",
        }}
        className="flex flex-col m-auto rounded-md"
      >
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          {/* Theme's default letterSpacing (0.7em, tuned for short titles like
              "COUNTRIES") makes a 2-word heading like "Sign In" run wide -
              override it down here rather than in the shared theme, which
              other screens' short headings still rely on. */}
          <Typography sx={{ ...workspaceHeadingSx, letterSpacing: "0.15em" }}>
            Sign In
          </Typography>
        </ThemeProvider>
        <Box className="flex flex-col mx-auto w-full">
          <FormControl
            fullWidth
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="max-h-[30%] overflow-y-hidden">
              <TextField
                label="email"
                name="email"
                size="small"
                onChange={handleChange}
                error={!!errors.email}
                variant="outlined"
                fullWidth
                margin="normal"
                sx={dropdownFieldSx}
              />
              {errors.email && (
                <div className="text-red-500 text-[.7em]">
                  {errors?.email && <span>{errors.email}</span>}
                </div>
              )}
            </div>

            <FormControl sx={dropdownFieldSx}>
              <InputLabel
                htmlFor="password"
                error={!!errors.password}
                // className="mt-2"
              >
                Password
              </InputLabel>
              <OutlinedInput
                type={showPassword ? "text" : "password"}
                name="password"
                label="password"
                size="small"
                onChange={handleChange}
                error={!!errors.password}
                fullWidth
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword
                          ? "hide the password"
                          : "display the password"
                      }
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            {errors.password && (
              <div className=" text-red-500 text-[.7em]">{errors.password}</div>
            )}

            <Button
              variant="contained"
              size="small"
              type="submit"
              className="mt-8"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : null
              }
              sx={primaryActionButtonSx}
            >
              <span style={themedButtonLabelStyle}>
                {isLoading ? "Logging in..." : "Login"}
              </span>
            </Button>
          </FormControl>
        </Box>
      </Box>
    </div>
  );
};

export default SignInForm;
