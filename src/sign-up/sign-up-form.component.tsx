import { useEffect, useState, type ChangeEvent } from "react";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import OutlinedInput from "@mui/material/OutlinedInput";
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
import { Bars } from "react-loading-icons";

import {
  signUpStart,
  resetSignUpState,
  updateUserStart,
} from "../sagaStore/user/user.action";
import { loadCountries } from "../services/country.service";
import type { Country } from "../interfaces/references/Country";
import type { User } from "../interfaces/register/User";
import { asideMenuTitleTypographyTheme } from "../themes/themes";
import { AddressType, GENDER_MAP } from "../interfaces/definitions";
import SelectList from "../lib/select-list.component";
import type { SignupFormData } from "../interfaces/register/signup";
import {
  getIsLoading,
  getRegisterSuccess,
} from "../sagaStore/user/user.selector";

const SignupForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Get the user from routing state safely
  const user = location.state as User | null;
  const isUpdateMode = !!user;

  // 2. Define a function to generate the schema dynamically based on the mode
  const getFormValidationSchema = (isEdit: boolean) => {
    return z
      .object({
        userName: z.coerce.string(),
        knownAs: z.coerce.string(),
        email: z.email("Invalid email address"),
        password: isEdit
          ? z.string().optional() // Optional during profile updates
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
        confirmPassword: isEdit ? z.string().optional() : z.string().min(6),
        gender: z.enum(GENDER_MAP, {
          message: "Please select the Gender",
        }),

        dateOfBirth: z.coerce.string(), // Kept as string to match HTML5 inputs cleanly
        phoneNumber: z.coerce.string().nullable(),
        streetAddress: z.coerce.string().nullable(),
        city: z.coerce.string().nullable(),
        postCode: z.coerce.string().nullable(),
        state: z.coerce.string().nullable(),
        countryCode: z.coerce.string().nullable(),
        photo: z.coerce.string().nullable(),
      })
      .superRefine((data, checkPassword) => {
        if (!isEdit) {
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

  // 3. Extract your TypeScript type definitions from the dynamic schema output template
  type signupFormData = z.infer<ReturnType<typeof getFormValidationSchema>>;
  type signupFormErrors = Partial<Record<keyof signupFormData, string[]>>;

  // 4. Setup your base fallback form shape
  const signupFormFallback: SignupFormData = {
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
    address: null,
  };

  // 5. Initialize state by flattening the incoming user object if it exists

  const [signupFormData, setSignupFormData] = useState<SignupFormData>(() => {
    if (!user) {
      return signupFormFallback;
    }

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

      // 🚀 FIX: Map the nested address object explicitly to satisfy your SignupFormData shape
      address: user.address
        ? {
            addressId: user.address.addressId,
            streetAddress: user.address.streetAddress || "",
            city: user.address.city || "",
            postCode: user.address.postCode || "",
            state: user.address.state || "",
            countryCode: user.address.countryCode || "",
            addressType: user.address.addressType,
            // country: user.address.country || "",
          }
        : null,
    };
  });

  // const [signupFormData, setSignupFormData] = useState<SignupFormData>(() => {
  //   if (!user) {
  //     return signupFormFallback;
  //   }

  //   return {
  //     ...signupFormFallback,
  //     ...user,
  //     dateOfBirth: user.dateOfBirth
  //       ? new Date(user.dateOfBirth).toISOString().split("T")[0]
  //       : "",
  //     streetAddress: user.address?.streetAddress || user.streetAddress || "",
  //     city: user.address?.city || user.city || "",
  //     state: user.address?.state || user.state || "",
  //     postCode: user.address?.postCode || user.postCode || "",
  //     countryCode: user.address?.countryCode || user.countryCode || "",
  //   };
  // });

  const [errors, setErrors] = useState<signupFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // wai 1
  // const { registerSuccess, isLoading } = useSelector(
  //   (state: any) => state.user,
  // );

  // way 2
  // Inline option if you don't want to use a separate selector file
  // const { registerSuccess, isLoading } = useSelector((state: RootState) => state.user);

  // way 3
  const isLoading = useSelector(getIsLoading);
  const registerSuccess = useSelector(getRegisterSuccess);

  // 6. Effects Hooks Timeline
  useEffect(() => {
    const getAllCountries = async () => {
      try {
        const response = await loadCountries({
          pageIndex: 0,
          pageSize: 100,
          sortColumn: null,
          sortOrder: null,
          filterColumn: null,
          filterQuery: null,
        });
        setCountries(response.data.items);
      } catch (error: unknown) {
        setCountries([]);
        console.log("Error fetching countries: ", error);
      }
    };
    getAllCountries();
  }, []);

  useEffect(() => {
    if (registerSuccess) {
      navigate("/");
      dispatch(resetSignUpState());
    }
  }, [registerSuccess, navigate, dispatch]);

  useEffect(() => {
    dispatch(resetSignUpState());
    return () => {
      dispatch(resetSignUpState());
    };
  }, [dispatch]);

  // 7. Input Data Validators
  const validateForm = (data: SignupFormData): signupFormErrors => {
    try {
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

  // 8. Visual Interaction Event Listeners
  function handleSelectedChange(e: SelectChangeEvent) {
    const { name, value } = e.target;
    setSignupFormData((prevData: SignupFormData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const updatedState = {
      ...signupFormData,
      [name]: name === "gender" ? GENDER_MAP[value] : value,
    };
    setSignupFormData(updatedState);
    const newErrors = validateForm(updatedState);
    setErrors(newErrors);
  };

  const handleCancel = () => {
    navigate("/");
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!signupFormData) return;

    const newErrors = validateForm(signupFormData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) return;

    try {
      // const sanitizedUser = {
      //   ...signupFormData,
      //   phoneNumber: signupFormData.phoneNumber || null,
      //   streetAddress: signupFormData.streetAddress || null,
      //   city: signupFormData.city || null,
      //   postCode: signupFormData.postCode || null,
      //   state: signupFormData.state || null,
      //   countryCode: signupFormData.countryCode || null,
      //   address: {
      //     streetAddress: signupFormData.streetAddress || null,
      //     city: signupFormData.city || null,
      //     postCode: signupFormData.postCode || null,
      //     state: signupFormData.state || null,
      //     countryCode: signupFormData.countryCode || null,
      //     addressType: signupFormData.addressType
      //       ? signupFormData.addressType
      //       : AddressType.Residential,
      //   },
      // };

      // 1. Build the nested address payload contract structure
      const nestedAddressPayload = {
        addressId: signupFormData.address?.addressId || null, // Preserves the C# Guid!
        streetAddress: signupFormData.streetAddress || null,
        city: signupFormData.city || null,
        postCode: signupFormData.postCode || null,
        state: signupFormData.state || null,
        countryCode: signupFormData.countryCode || null,
        addressType: signupFormData.addressType || AddressType.Residential,
        default: signupFormData.default ?? true,
        country: signupFormData.address?.country || null,
      };

      if (isUpdateMode) {
        // console.log(
        //   "Trigger profile edit action pipeline here using sanitizedUser package:",
        //   sanitizedUser,
        // );
        // const address: Address = {
        //   streetAddress: sanitizedUser.streetAddress,
        //   city: sanitizedUser.city,
        //   state: sanitizedUser.state,
        //   postCode: sanitizedUser.postCode,
        //   countryCode: sanitizedUser.countryCode,
        //   addressType: sanitizedUser.addressType,
        //   default: sanitizedUser.default,
        //   country: "",
        //   id: 0,
        //   addressId: "",
        // };
        //console.log("created address : ", address);

        // 2. Map payload cleanly for Update Mode
        const updatePayload = {
          knownAs: signupFormData.knownAs,
          email: signupFormData.email,
          userName: signupFormData.userName || signupFormData.email,
          gender: signupFormData.gender,
          phoneNumber: signupFormData.phoneNumber || null,
          profilePhoto: signupFormData.photo || null,
          dateOfBirth: signupFormData.dateOfBirth, // String format yyyy-MM-dd
          address: nestedAddressPayload, // Injected as a nested object
        };

        // const finalPayload: User = {
        //   knownAs: sanitizedUser.knownAs,
        //   email: sanitizedUser.email,
        //   userName: sanitizedUser.userName,
        //   gender: sanitizedUser.gender,
        //   phoneNumber: sanitizedUser.phoneNumber,
        //   streetAddress: sanitizedUser.streetAddress,
        //   city: sanitizedUser.city,
        //   state: sanitizedUser.state,
        //   postCode: sanitizedUser.postCode,
        //   countryCode: sanitizedUser.countryCode,
        //   addressType: sanitizedUser.addressType,
        //   default: sanitizedUser.default,
        //   password: "",
        //   confirmPassword: "",
        //   profilePhoto: sanitizedUser.photo as BinaryType, // Cast photo to model requirements
        //   dateOfBirth: new Date(sanitizedUser.dateOfBirth),
        //   address: null,
        //   // address: address,
        //   // address: {
        //   //   streetAddress: sanitizedUser.streetAddress,
        //   //   city: sanitizedUser.city,
        //   //   state: sanitizedUser.state,
        //   //   postCode: sanitizedUser.postCode,
        //   //   countryCode: sanitizedUser.countryCode,
        //   //   addressType: sanitizedUser.addressType,
        //   //   default: sanitizedUser.default,
        //   //   country: "",
        //   //   id: 0,
        //   //   addressId: "",
        //   // },
        // };
        // console.log("passed User finalPayload : ", finalPayload);
        // console.log("passed User sanitaized : ", sanitizedUser);
        // dispatch(updateUserStart(finalPayload));
        dispatch(updateUserStart(updatePayload as unknown as User));
        navigate("/");
        // dispatch(updateUserStart(sanitizedUser as unknown as User));
      } else {
        // 3. Map payload cleanly for New Registration Mode
        if (!signupFormData.password || !signupFormData.confirmPassword) {
          alert(
            "Password fields are required for creating a new user account.",
          );
          return;
        }
        if (signupFormData.password !== signupFormData.confirmPassword) {
          alert("Your passwords do not match");
          return;
        }

        // // 🚀 2. FIX: Force standard validation parameters check
        // if (!sanitizedUser.password || !sanitizedUser.confirmPassword) {
        //   alert(
        //     "Password fields are required for creating a new user account.",
        //   );
        //   return;
        // }
        // if (sanitizedUser.password !== sanitizedUser.confirmPassword) {
        //   alert("Your passwords do not match");
        //   return;
        // }

        const registrationPayload: User = {
          knownAs: signupFormData.knownAs,
          email: signupFormData.email,
          userName: signupFormData.userName || signupFormData.email,
          gender: signupFormData.gender,
          phoneNumber: signupFormData.phoneNumber || null,
          streetAddress: signupFormData.streetAddress || null,
          city: signupFormData.city || null,
          state: signupFormData.state || null,
          postCode: signupFormData.postCode || null,
          countryCode: signupFormData.countryCode || null,
          addressType: signupFormData.addressType,
          default: signupFormData.default,
          // profilePhoto: signupFormData.photo as any,
          profilePhoto: (signupFormData.photo as BinaryType) || null,
          password: signupFormData.password,
          confirmPassword: signupFormData.confirmPassword,
          dateOfBirth: new Date(signupFormData.dateOfBirth),
          address: null,
        };

        // Replace your dispatch block with a true mapping step:
        // const finalPayload: User = {
        //   knownAs: sanitizedUser.knownAs,
        //   email: sanitizedUser.email,
        //   userName: sanitizedUser.userName,
        //   gender: sanitizedUser.gender,
        //   phoneNumber: sanitizedUser.phoneNumber,
        //   streetAddress: sanitizedUser.streetAddress,
        //   city: sanitizedUser.city,
        //   state: sanitizedUser.state,
        //   postCode: sanitizedUser.postCode,
        //   countryCode: sanitizedUser.countryCode,
        //   addressType: sanitizedUser.addressType,
        //   default: sanitizedUser.default,
        //   profilePhoto: sanitizedUser.photo as BinaryType, // Cast photo to model requirements
        //   address: null,

        //   // 🚀 Explicitly fix the password type contract
        //   password: sanitizedUser.password!, // The '!' operator guarantees it is not undefined
        //   confirmPassword: sanitizedUser.confirmPassword!,

        //   // 🚀 Explicitly convert your form string back into a real C# / JS Date object
        //   dateOfBirth: new Date(sanitizedUser.dateOfBirth),
        // };
        // dispatch(signUpStart(sanitizedUser as unknown as User));
        // dispatch(signUpStart(finalPayload));
        dispatch(signUpStart(registrationPayload));
      }
    } catch (error: unknown) {
      console.error("Submission failed: ", error);
    }
  };

  // 9. Component Interface Render Layout
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
              onSubmit={handleSubmit}
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
                    // InputLabelProps={{ shrink: true }} // Keeps your layout clean
                    value={signupFormData.dateOfBirth} // 🚀 Reads straight from your flat state!
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
                      className="flex justify-around rounded-md"
                    >
                      <FormControlLabel
                        value={"Male"}
                        control={<Radio />}
                        label="Male"
                        className={"p-1"}
                      />
                      <FormControlLabel
                        value={"Female"}
                        control={<Radio />}
                        label="Female"
                        className={"p-1"}
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
                    value={signupFormData.streetAddress}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    name="city"
                    label="City"
                    margin="normal"
                    size="small"
                    value={signupFormData.city}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    name="postCode"
                    label="Post Code"
                    margin="normal"
                    size="small"
                    value={signupFormData.postCode}
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
                    value={signupFormData.state}
                    onChange={handleChange}
                  />
                </FormControl>
                <div className="w-[50%]">
                  <SelectList
                    data={countries}
                    name="countryCode"
                    value={signupFormData.countryCode || ""}
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
                  {isUpdateMode ? "Update Profile" : "Sign Up User"}
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
        <div className="flex justify-around relative1 absolute top-0 left-0 z-60 ml-170 mt-10 bg-1gray-600">
          {/* <Puff stroke="#60a5fa" /> */}
          <Bars stroke="#60a5fa" strokeOpacity={1.0} speed={1.0} />
          {/* <Puff stroke="#98ff98" strokeOpacity={1.0} speed={0.75} /> */}
        </div>
      )}
    </>
  );
};

export default SignupForm;
