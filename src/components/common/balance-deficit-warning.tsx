import { Tooltip } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { balanceDeficitTextColor } from "../../themes/workspace-theme";

interface BalanceDeficitWarningProps {
  message: string;
}

// A compact stand-in for the old inline <Typography variant="caption"> warning
// under a Quantity field - that text wrapped onto 2-3 lines in a narrow table
// cell and pushed the whole row taller, breaking the table's fixed row height.
// This renders as a single small icon (constant footprint regardless of
// message length) with the full text available on hover/focus via Tooltip.
// Shared across every Note grid with an "exceeded balance" style validation
// message, both Orderwise and General Inventory, so they all read the same way.
export default function BalanceDeficitWarning({ message }: BalanceDeficitWarningProps) {
  return (
    <Tooltip title={message} arrow>
      <WarningAmberIcon
        fontSize="small"
        sx={{ color: balanceDeficitTextColor, cursor: "help", verticalAlign: "middle", mt: 0.5 }}
      />
    </Tooltip>
  );
}
