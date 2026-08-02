import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  type SxProps,
  type Theme,
} from "@mui/material";

type SelectListProps<T> = {
  data: T[];
  name: string;
  value: string | number;
  label: string; // Add this to show the title (e.g., "Branch")
  disabled?: boolean;
  labelKey: keyof T;
  valueKey: keyof T;
  handleSelectedChange: (event: SelectChangeEvent<string>) => void;
  // Optional - defaults preserve existing behavior everywhere this component
  // is already used, so only screens that opt in are affected.
  size?: "small" | "medium";
  labelSx?: SxProps<Theme>;
  // Optional overrides for the dropdown popup's background and each option's
  // text/hover colors. Both default to the component's original white/black
  // styling below, so the sign-up form (the only other screen using
  // SelectList, on a light theme) sees zero visual change unless it opts in.
  menuSx?: SxProps<Theme>;
  menuItemSx?: SxProps<Theme>;
};

const SelectList = <T,>({
  data,
  name,
  value,
  label,
  labelKey,
  valueKey,
  disabled,
  handleSelectedChange,
  size,
  labelSx,
  menuSx,
  menuItemSx,
}: SelectListProps<T>) => {
  return (
    <FormControl fullWidth variant="outlined" size={size} sx={{ mb: 0 }}>
      {/* The Label component that sits on the border */}
      <InputLabel id={`${name}-label`} sx={labelSx ?? { color: "gray" }}>
        {label}
      </InputLabel>

      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        // MUI matches the Select's `value` against each MenuItem's `value` with strict
        // equality. MenuItem values here are always stringified (see itemValue below), so
        // the Select's own value must be normalized to a string too -- otherwise a numeric
        // `value` (e.g. Garment Type's id) never matches its own stringified MenuItem and
        // the control renders as empty even though the underlying data is set correctly.
        value={
          value === undefined || value === null || value === ""
            ? ""
            : String(value)
        }
        onChange={handleSelectedChange}
        label={label} // CRITICAL: This carves out the gap in the border
        disabled={disabled}
        size={size}
        sx={{
          backgroundColor: "white",
          color: "black", // Ensures selected text is visible
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.23)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#3b82f6",
          },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                backgroundColor: "white",
                color: "black",
                ...menuSx,
              },
            },
          },
        }}
      >
        {data?.length > 0 ? (
          data.map((item, index) => {
            const itemValue = String(item[valueKey]);
            const itemLabel = String(item[labelKey]);

            return (
              <MenuItem
                key={index}
                value={itemValue}
                sx={{
                  color: "black", // Force text color to black
                  "&:hover": { backgroundColor: "#3b82f6", color: "white" },
                  ...menuItemSx,
                }}
              >
                {itemLabel}
              </MenuItem>
            );
          })
        ) : (
          <MenuItem disabled>No data available</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default SelectList;
