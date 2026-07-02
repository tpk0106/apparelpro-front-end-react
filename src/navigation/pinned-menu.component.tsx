import { Switch } from "@mui/material";
import React from "react";

interface pinnedMenuProps {
  onToggle: (val: boolean) => void;
}

const PinnedMenu = ({ onToggle }: pinnedMenuProps) => {
  const [checked, setChecked] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    onToggle(event.target.checked);
  };

  return (
    <div>
      <Switch
        checked={checked}
        onChange={handleChange}
        slotProps={{ input: { "aria-label": "controlled" } }}
      />
    </div>
  );
};

export default PinnedMenu;
