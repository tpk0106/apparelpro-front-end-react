import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
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
}: SelectListProps<T>) => {
  return (
    <FormControl fullWidth variant="outlined" sx={{ mb: 0 }}>
      {/* The Label component that sits on the border */}
      <InputLabel id={`${name}-label`} sx={{ color: "gray" }}>
        {label}
      </InputLabel>

      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={value || ""}
        onChange={handleSelectedChange}
        label={label} // CRITICAL: This carves out the gap in the border
        disabled={disabled}
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
