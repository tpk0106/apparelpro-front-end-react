import { useEffect, useState, type ChangeEvent } from "react";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
  ThemeProvider,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
// import { format } from "date-fns";

import { Bars } from "react-loading-icons";

import {
  signUpStart,
  resetSignUpState,
  // resetSignInState,
} from "../sagaStore/user/user.action";
import { loadCountries } from "../services/country.service";

import type { Country } from "../interfaces/references/Country";
import type { User } from "../interfaces/register/User";

import { asideMenuTitleTypographyTheme } from "../themes/themes";
import {
  AddressType,
  GENDER_MAP,
  // GENDER_MAP_REVERSE,
  // GENDER_MAP,
  // GENDER_MAP_REVERSE,
} from "../interfaces/definitions";
import SelectList from "../lib/select-list.component";

const SignupForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Get the user from routing state safely
  const user = location.state as User | null;
  const isUpdateMode = !!user;

  // 2. Define the Zod Schema FIRST so TypeScript can read it for types below
  const signupFormSchema = z.object({
    userName: z.coerce.string(),
    knownAs: z.coerce.string(),
    email: z.email("Invalid email address"),
    password: isUpdateMode
      ? z.string().optional() // Optional during profile updates
      : z
          .string()
          .min(6, "Password must be at least 6 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[0-9]/, "Password must contain at least one number")
          .regex(
            /[!@#$%*]/,
            "Password must contain at least one special character",
          ),
    confirmPassword: isUpdateMode ? z.string().optional() : z.string().min(6),
    gender: z.coerce.number().gt(0).lt(3),
    dateOfBirth: z.coerce.string(), // Kept as string to match HTML5 inputs cleanly
    phoneNumber: z.coerce.string().nullable(),
    streetAddress: z.coerce.string().nullable(),
    city: z.coerce.string().nullable(),
    postCode: z.coerce.string().nullable(),
    state: z.coerce.string().nullable(),
    countryCode: z.coerce.string().nullable(),
    photo: z.coerce.string().nullable(),
  });

  // 3. Infer your types directly AFTER the schema is written
  type signupFormData = z.infer<typeof signupFormSchema>;
  type signupFormErrors = Partial<Record<keyof signupFormData, string[]>>;

  // 4. Setup your base fallback form shape
  const signupFormFallback: any = {
    knownAs: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: 0,
    phoneNumber: "",
    dateOfBirth: new Date().toISOString().split("T")[0], // Standard YYYY-MM-DD
    userName: "",
    streetAddress: "",
    photo: null,
    city: "",
    state: "",
    postCode: "",
    countryCode: "",
    addressType: AddressType.Residential,
    default: true,
  };

  // 5. Initialize state by flattening the incoming user object if it exists
  const [signupFormData, setSignupFormData] = useState<any>(() => {
    if (!user) return signupFormFallback;
    return {
      ...signupFormFallback,
      ...user,
      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
      streetAddress: user.address?.streetAddress || user.streetAddress || "",
      city: user.address?.city || user.city || "",
      state: user.address?.state || user.state || "",
      postCode: user.address?.postCode || user.postCode || "",
      countryCode: user.address?.countryCode || user.countryCode || "",
    };
  });

  const [errors, setErrors] = useState<signupFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const { registerSuccess, isLoading } = useSelector(
    (state: any) => state.user,
  );

  // ... Your useEffects, validateForm, and Handlers continue below here

  // const location = useLocation();

  // const user = location.state as User | null;

  // const isUpdateMode = !!user;
  // // console.log("passed user :", user);

  // const signupForm: User = {
  //   knownAs: "",
  //   email: "",
  //   password: "",
  //   confirmPassword: "",
  //   gender: 0, // GENDER_MAP["Male"],
  //   phoneNumber: "",
  //   dateOfBirth: new Date(),
  //   userName: "",
  //   streetAddress: "",
  //   photo: null,
  //   city: "",
  //   state: "",
  //   postCode: "",
  //   countryCode: "",
  //   addressType: AddressType.Residential,
  //   default: true,
  //   address: null,
  // };

  // // let user = user1 ? user1 : signupForm;
  // // const [signupFormData, setSignupFormData] = useState<signupFormData>(
  // //   user ? user : signupForm,
  // // );

  // // Hydrate the state flat wrapper safely upon mounting execution
  // const getInitialFormData = () => {
  //   if (!user) return signupForm;

  //   return {
  //     ...signupForm,
  //     ...user,
  //     // 🚀 Format the date cleanly to YYYY-MM-DD for the HTML5 view element
  //     dateOfBirth: user.dateOfBirth
  //       ? new Date(user.dateOfBirth).toISOString().split("T")[0]
  //       : "",
  //     // 🚀 Extract nested data keys out of your database structure and flatten them onto the root
  //     streetAddress: user.address?.streetAddress || user.streetAddress || "",
  //     city: user.address?.city || user.city || "",
  //     state: user.address?.state || user.state || "",
  //     postCode: user.address?.postCode || user.postCode || "",
  //     countryCode: user.address?.countryCode || user.countryCode || "",
  //   };
  // };

  // const [signupFormData, setSignupFormData] =
  //   useState<any>(getInitialFormData());

  // const [signupFormData, setSignupFormData] = useState<signupFormData>(
  //   user
  //     ? {
  //         ...signupForm,
  //         ...user,
  //         ["dateOfBirth"]: new Date(
  //           new Date(user.dateOfBirth).toISOString().split("T")[0],
  //         ),
  //       }
  //     : signupForm,
  // );
  // const [errors, setErrors] = useState<signupFormErrors>({});
  // const [showPassword, setShowPassword] = useState(false);
  // const [countries, setCountries] = useState<Country[]>([]);
  // const handleClickShowPassword = () => setShowPassword((show) => !show);

  // const navigate = useNavigate();
  // const dispatch = useDispatch();

  useEffect(() => {
    const getAllCountries = async () => {
      try {
        await loadCountries({
          pageNumber: 0,
          pageSize: 100,
          sortColumn: null,
          sortOrder: null,
          filterColumn: null,
          filterQuery: null,
        }).then((countries) => {
          setCountries(countries.data.items);
        });
      } catch (error: unknown) {
        setCountries([]);
        console.log("Error fetching countries: ", error);
        // throw new Error((error as AxiosError).message);
      }
    };

    getAllCountries();
  }, []);

  // Define a function to generate the schema dynamically based on the mode
  const getFormValidationSchema = (isUpdateMode: boolean) => {
    return z
      .object({
        userName: z.coerce.string(),
        knownAs: z.coerce.string(),
        email: z.email("Invalid email address"),

        // 🚀 If it's update mode, allow password to be an optional blank string
        password: isUpdateMode
          ? z.string().optional()
          : z
              .string()
              .min(6, "Password must be at least 6 characters")
              .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter",
              )
              .regex(/[0-9]/, "Password must contain at least one number")
              .regex(
                /[!@#$%*]/,
                "Password must contain at least one special character",
              ),

        confirmPassword: isUpdateMode
          ? z.string().optional()
          : z.string().min(6),

        gender: z.coerce.number().gt(0).lt(3),
        dateOfBirth: z.coerce.date(),
        phoneNumber: z.coerce.string().nullable(),

        // Smooth out the layout definitions so both root and nested fields are compile-safe
        streetAddress: z.coerce.string().nullable(),
        city: z.coerce.string().nullable(),
        postCode: z.coerce.string().nullable(),
        state: z.coerce.string().nullable(),
        countryCode: z.coerce.string().nullable(),
        photo: z.coerce.string().nullable(),
      })
      .superRefine((data, checkPassword) => {
        // Only run password verification matches if we are creating a brand new account
        if (!isUpdateMode) {
          if (data.password && data.password.length <= 5) {
            checkPassword.addIssue({
              path: ["password"],
              code: "custom",
              message: "Password must be at least 5 characters long",
            });
          }
          if (data.password !== data.confirmPassword) {
            checkPassword.addIssue({
              path: ["confirmPassword"],
              code: "custom",
              message: "Your passwords do not match",
            });
          }
        }
      });
  };

  // const signupFormSchema = z
  //   .object({
  //     userName: z.coerce.string(),
  //     knownAs: z.coerce.string(),
  //     email: z.email("Invalid email address"),
  //     password: z
  //       .string()
  //       .min(6, "Password must be at least 6 characters")
  //       .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  //       .regex(/[0-9]/, "Password must contain at least one number")
  //       .regex(
  //         /[!@#$%*]/,
  //         "Password must contain at least one special character",
  //       ),
  //     confirmPassword: z
  //       .string()
  //       .min(6, "Confirm Password must be at least 6 characters"),

  //     gender: z.coerce.number().gt(0).lt(3),
  //     dateOfBirth: z.coerce.date(),
  //     phoneNumber: z.coerce.string().nullable(),
  //     streetAddress: z.coerce.string().nullable(),
  //     city: z.coerce.string().nullable(),
  //     postCode: z.coerce.string().nullable(),
  //     state: z.coerce.string().nullable(),
  //     countryCode: z.coerce.string().nullable(),
  //     photo: z.coerce.string().nullable(),
  //     address: z.object({
  //       streetAddress: z.string(),
  //       city: z.string(),
  //       postCode: z.string(),
  //       state: z.string(),
  //       countryCode: z.string(),
  //     }),
  //   })
  //   .superRefine(({ password }, checkPassword) => {
  //     if (password.length <= 5) {
  //       checkPassword.addIssue({
  //         code: "custom",
  //         message: "Password must be at least 5 characters long",
  //       });
  //     }
  //   });

  // type signupFormData = z.infer<typeof signupFormSchema>;
  // type signupFormErrors = Partial<Record<keyof signupFormData, string[]>>;

  // // Grab the success and loading fields from your reducer
  // // const { success, isLoading } = useSelector((state: any) => state.user);
  // // 1. Destructure registerSuccess instead of success
  // const { registerSuccess, isLoading } = useSelector(
  //   (state: any) => state.user,
  // );

  // ONLY navigate away if the registration explicitly succeeded
  useEffect(() => {
    // console.log("register success changed: ", registerSuccess);
    // console.log("Passed Form Data : ", signupFormData);
    // console.log("Passed Form Data : ", signupFormData.address);

    // ONLY navigate if registration explicitly succeeded
    if (registerSuccess) {
      navigate("/");

      // Clear out the flag so it doesn't trigger again if you come back
      dispatch(resetSignUpState());
    }
  }, [registerSuccess, navigate, dispatch]);

  useEffect(() => {
    // Reset flags immediately when user loads this screen
    dispatch(resetSignUpState()); // Reset the sign-up state when the component mounts'
    // dispatch(resetSignInState()); // reset the signin state when the component munts from previous login if any.
    // Optional clean up: resets flags again if they leave the page midway
    return () => {
      dispatch(resetSignUpState()); // Clean up by resetting the state when the component unmounts
      // dispatch(resetSignInState());
    };
  }, [dispatch]);

  const validateForm = (data: any): signupFormErrors => {
    try {
      // Pass the running operational mode down to the validation rule builder
      const schema = getFormValidationSchema(isUpdateMode);
      schema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const flattened = z.flattenError(error);
        return flattened.fieldErrors as signupFormErrors;
      }
      return {};
    }
  };

  // const validateForm = (data: signupFormData): signupFormErrors => {
  //   try {
  //     signupFormSchema.parse(data);
  //     return {};
  //   } catch (error) {
  //     if (error instanceof z.ZodError) {
  //       // Use z.flattenError to extract flat fieldErrors directly
  //       const flattened = z.flattenError(error);
  //       return flattened.fieldErrors as signupFormErrors;
  //     }
  //     return {};
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signupFormData) return;

    const newErrors = validateForm(signupFormData);
    setErrors(newErrors);
    console.log("Raised Errors", errors);
    if (Object.keys(newErrors).length !== 0) {
      return;
    }

    // Only run matching alert guards if we aren't in edit mode
    if (
      !isUpdateMode &&
      signupFormData.password !== signupFormData.confirmPassword
    ) {
      alert("Your passwords do not match");
      return;
    }

    // // Inside your handleSubmit function:
    // if (
    //   signupFormData.password.toLowerCase() !==
    //   signupFormData.confirmPassword.toLowerCase()
    // ) {
    //   alert("Your passwords do not match");
    //   return;
    // }

    if (Object.keys(newErrors).length === 0) {
      // form is valid proceed !
    }

    try {
      const newUser = signupFormData;

      // Convert any empty strings back to null so .NET / SQL receives true NULL values
      const sanitizedUser = {
        ...newUser,
        phoneNumber: newUser.phoneNumber || null,
        streetAddress: newUser.streetAddress || null,
        city: newUser.city || null,
        postCode: newUser.postCode || null,
        state: newUser.state || null,
        countryCode: newUser.countryCode || null,
      };

      if (isUpdateMode) {
        console.log("Trigger profile edit action pipeline here...");
        // dispatch(updateProfileStart(sanitizedUser));
      } else {
        // redux
        dispatch(signUpStart(sanitizedUser));
      }
    } catch (error: unknown) {
      console.error("Submission failed: ", error);
    }
  };

  // const imageDataUrl = (data: unknown): string => {
  //   const url: string = "data:image/jpeg;base64," + data;
  //   return url;
  // };

  function handleSelectedChange(e: SelectChangeEvent) {
    const { name, value } = e.target;

    // Update the form data state with the new value
    setSignupFormData((prevData) => {
      return {
        ...prevData,
        [name]: value,
      };
    });
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    // 1. Compute the exact next value snapshot object
    const updatedState = {
      ...signupFormData,
      [name]: value,
    };

    setSignupFormData(updatedState);

    // 2. Validate using the updatedState data reference instead of the stale hook value!
    const newErrors = validateForm(updatedState);
    setErrors(newErrors);

    // setSignupFormData((prevData) => ({
    //   ...prevData,
    //   [name]: value,
    // }));
    // const newErrors = validateForm(signupFormData);
    // setErrors(newErrors);
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <>
      <div className="flex justify-center w-full m-auto h1-screen h-1/2 mx-auto my-auto mt-10 mb-5 ">
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "50%", padding: 4 }}
          className="flex flex-col m-auto border rounded-md border-gray-300 shadow-xl"
        >
          <ThemeProvider theme={asideMenuTitleTypographyTheme}>
            <Typography color="blue-gray" className="text-center">
              Sign Up
            </Typography>
          </ThemeProvider>
          <Box className="flex flex-col mx-auto w-full">
            <FormControl
              fullWidth
              onSubmit={() => handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex w-full justify-around p-0 m-0 border1-4 border1-red-600">
                <FormControl className="w-[30%]">
                  <TextField
                    name="knownAs"
                    label="Your Name"
                    margin="normal"
                    size="small"
                    value={signupFormData.knownAs}
                    onChange={handleChange}
                    className="w-[95%]"
                  />
                </FormControl>
                <FormControl className="w-[30%]">
                  <TextField
                    label="email"
                    name="email"
                    size="small"
                    value={signupFormData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    className="w-[95%]"
                  />
                  {errors.email && (
                    <div className="text-red-500 text-[.7em]">
                      {errors?.email && <span>{errors.email}</span>}
                    </div>
                  )}
                </FormControl>
                <FormControl className="w-[30%]">
                  <TextField
                    name="dateOfBirth"
                    type="date"
                    margin="normal"
                    size="small"
                    InputLabelProps={{ shrink: true }} // Keeps your layout clean
                    value={signupFormData.dateOfBirth} // 🚀 Reads straight from your flat state!
                    // value={
                    //   user.dateOfBirth &&
                    //   format(
                    //     new Date(
                    //       new Date(user?.dateOfBirth)
                    //         .toISOString()
                    //         .split("T")[0],
                    //     ),
                    //     "yyyy-MM-dd",
                    //   )
                    // } // Format date to YYYY-MM-DD for input
                    className="w-[95%]"
                    onChange={handleChange}
                  />
                </FormControl>
              </div>

              <div className="flex w-full justify-around p-0 m-0">
                <FormControl className="flex w-[49%] justify-around px-10">
                  <div className="flex w-full justify-around items-center border border-gray-300 rounded-md">
                    <FormLabel>Gender</FormLabel>

                    <RadioGroup
                      row
                      name="gender"
                      value={
                        signupFormData.gender === GENDER_MAP["Male"]
                          ? "Male"
                          : "Female"
                      }
                      onChange={handleChange}
                      className="flex justify-around border1 border1-gray-300 rounded-md"
                    >
                      <FormControlLabel
                        value={"Female"}
                        control={<Radio />}
                        label="Female"
                        className={"border1 border1-gray-300 rounded1-md p-1"}
                      />
                      <FormControlLabel
                        value={"Male"}
                        control={<Radio />}
                        label="Male"
                        className={"border1 border1-gray-300 rounded1-md p-1"}
                      />
                    </RadioGroup>
                  </div>
                </FormControl>
                <FormControl className="w-[49%]">
                  <TextField
                    name="phoneNumber"
                    label="Phone number/Mobile Number"
                    type="number"
                    margin="normal"
                    size="small"
                    value={signupFormData.phoneNumber}
                    onChange={handleChange}
                  />
                </FormControl>
              </div>

              {/* </FormControl> */}
              {errors.gender && (
                <div className="flex w-full py-0 text-red-600 justify-start ml-0 text-sm z-10 1absolute top1-45">
                  {errors.gender}
                </div>
              )}

              {/* 🚀 ONLY render password elements if registering a new profile */}
              {!isUpdateMode && (
                <div className="flex w-full justify-around p-0 m-0 border1-4 border1-red-600">
                  {/* Force variant="outlined" on the container */}
                  <FormControl
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="normal"
                  >
                    <InputLabel htmlFor="password" error={!!errors.password}>
                      Password
                    </InputLabel>
                    <OutlinedInput
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      label="Password" // <-- Must match the exact string inside InputLabel
                      onChange={handleChange}
                      error={!!errors.password}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.password && (
                      <div className="text-red-500 text-[.7em] mt-1">
                        {errors.password}
                      </div>
                    )}
                  </FormControl>

                  {/* Force variant="outlined" on the container */}
                  <FormControl
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="normal"
                  >
                    <InputLabel
                      htmlFor="confirmPassword"
                      error={!!errors.confirmPassword}
                    >
                      Confirm Password
                    </InputLabel>
                    <OutlinedInput
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      label="Confirm Password" // <-- Must match the exact string inside InputLabel
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.confirmPassword && (
                      <div className="text-red-500 text-[.7em] mt-1">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </FormControl>
                </div>
              )}

              <div className="flex w-full justify-around p-0 m-0 border1-4 border1-red-600">
                <FormControl>
                  <TextField
                    name="streetAddress"
                    label="Street Address"
                    margin="normal"
                    size="small"
                    value={signupFormData.address.streetAddress}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    name="city"
                    label="City"
                    margin="normal"
                    size="small"
                    value={signupFormData.address.city}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    name="postCode"
                    label="Post Code"
                    margin="normal"
                    size="small"
                    value={signupFormData.address.postCode}
                    onChange={handleChange}
                  />
                </FormControl>
              </div>
              <div className="flex w-full justify-around p-0 m-0 border1-4 border1-red-600">
                <FormControl>
                  <TextField
                    name="state"
                    label="State"
                    margin="normal"
                    size="small"
                    value={signupFormData.address.state}
                    onChange={handleChange}
                  />
                </FormControl>
                <div className="w-[50%]">
                  <SelectList
                    data={countries}
                    name="countryCode"
                    value={signupFormData.address.countryCode || ""}
                    label="Country"
                    labelKey="name"
                    valueKey="code"
                    handleSelectedChange={handleSelectedChange}
                  />
                </div>
              </div>

              <div className="flex justify-around w-full">
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  type="submit"
                  className="mt-8 w-[45%]"
                >
                  Sign Up
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  type="submit"
                  className="mt-8 w-[45%]"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </FormControl>
          </Box>
        </Box>
      </div>
      {isLoading && (
        <div className="flex justify-around absolute z-50 ml-130 mt-30">
          {/* <Puff stroke="#98ff98" /> */}
          <Bars stroke="#000" />
          {/* <Puff stroke="#98ff98" strokeOpacity={1.0} speed={0.75} /> */}
        </div>
      )}
    </>
  );
};

export default SignupForm;
