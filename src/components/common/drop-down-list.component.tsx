import { Autocomplete, TextField } from "@mui/material";

interface DropdownListProps<T> {
  datalist: T[];
  label: string;
  selectedValue: string;
  handleChange: () => void;
}

const DropDownList = ({
  datalist,
  label,
  selectedValue,
  handleChange,
}: DropdownListProps<any>) => {
  <Autocomplete
    options={datalist}
    getOptionLabel={(option: T) => option.name || ""}
    value={selectedValue}
    onChange={(_, val) => handleChange(val)}
    isOptionEqualToValue={(option, value) =>
      option.buyerCode === value?.buyerCode
    }
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        size="small"
        // sx={{ backgroundColor: "#000", borderRadius: "4px" }}
      />
    )}
  />;
};

export default DropDownList;
