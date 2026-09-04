import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  MaterialReactTable,
  createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import type { DailyProductionTimeTicketEntry } from "../../../interfaces/production/DailyProductionTimeTicket";
import type { TicketScope } from "../../../services/production/daily-production-time-ticket.service";
import {
  useGetEmployees,
  useGetOperations,
  useGetNonProductiveHourCodes,
} from "../../../tanstack-hooks/production-reference.hooks";
import { useGetSystemParametersQuery } from "../../../tanstack-hooks/custom-hooks";
import { useBulkSaveDailyProductionTimeTicketMutation } from "../../../tanstack-hooks/daily-production-time-ticket.hooks";
import { useGetOperationBreakdownByStyle } from "../../../tanstack-hooks/production-style-breakdown.hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  deleteRowIconButtonSx,
  numberFieldNoSpinnerSx,
} from "../../../themes/workspace-theme";
import ConfirmDialog from "../../common/confirm-dialog";

// Matches legacy PR_DPTT1.PRG's field-level rules exactly:
// - Quantity: `valid mm_fld > 0` - strictly positive, not just non-negative
//   (a time ticket entry reporting zero pieces produced doesn't mean anything).
// - NPH: `valid mm_fld >= 0` - non-negative is genuinely correct here.
// - Work Hours: `valid mm_fld > 0` - but legacy also auto-fills a factory
//   default (see workHoursDefault below) rather than forcing manual entry
//   every time, so this stays a hard requirement only as the final backstop.
const rowSchema = z.object({
  employeeCode: z.string().trim().min(1, "Employee required"),
  operationCode: z.string().trim().min(1, "Operation required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  nonProductiveHours: z.coerce.number().nonnegative("NPH must be 0 or more"),
  workHours: z.coerce.number().positive("Work hours must be greater than 0"),
});

type ValidationErrors = Partial<Record<keyof DailyProductionTimeTicketEntry, string>>;

const validateRow = (values: DailyProductionTimeTicketEntry): ValidationErrors => {
  const result = rowSchema.safeParse(values);
  if (result.success) return {};
  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof DailyProductionTimeTicketEntry;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
};

interface Props {
  scope: TicketScope;
  rows: DailyProductionTimeTicketEntry[];
  setRows: React.Dispatch<React.SetStateAction<DailyProductionTimeTicketEntry[]>>;
  isLoading: boolean;
}

const DailyProductionTimeTicketTable = ({ scope, rows, setRows, isLoading }: Props) => {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownSelectMenuProps = { slotProps: { paper: { sx: dropdownListboxSx } } };
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<DailyProductionTimeTicketEntry> | null>(null);

  // "Production Work Hours Per Day" (System Parameters > Production Control) -
  // legacy PR_DPTT1.PRG's `m_wrk_hrs = if(wrk_hrs=0,factpara->work_hrs,wrk_hrs)`:
  // a new entry's Work Hours starts pre-filled with the factory shift length
  // instead of forcing manual entry every time, while staying fully editable.
  const { data: systemParameters = [] } = useGetSystemParametersQuery();
  const workHoursDefault = Number(
    systemParameters.find((p) => p.parameterKey === "ProductionWorkHoursPerDay")?.value ?? 0,
  );

  const { data: employeePageData } = useGetEmployees({
    pageIndex: 0, pageSize: 999, sortColumn: "employeeCode", sortOrder: "asc",
    filterColumn: null, filterQuery: null,
  });
  const employeeOptions = employeePageData?.items ?? [];

  const { data: operationPageData } = useGetOperations({
    pageIndex: 0, pageSize: 999, sortColumn: "operationCode", sortOrder: "asc",
    filterColumn: null, filterQuery: null,
  });
  const operationOptions = operationPageData?.items ?? [];

  // Legacy PR_DPTT1.PRG rejects any op code not in the style's own Style
  // Operation Breakdown ("Not a valid Operation Code for given Style") - the
  // global operations master list above is only for resolving code -> name
  // for display (existing entries may reference a code no longer in a since-
  // edited breakdown), not for what a NEW entry is allowed to pick.
  // buyerName/typeName are unused by this query (see toQueryParams in
  // style-operation-breakdown.service.ts) - stubbed here only to satisfy
  // StyleScope's type, which TicketScope doesn't carry.
  const { data: styleOperations = [], isLoading: isStyleOperationsLoading } =
    useGetOperationBreakdownByStyle({
      buyerCode: scope.buyerCode,
      buyerName: "",
      order: scope.order,
      typeCode: scope.typeCode,
      typeName: "",
      styleCode: scope.styleCode,
    });
  const allowedOperationCodes = new Set(styleOperations.map((op) => op.operationCode));
  const allowedOperationOptions = operationOptions.filter((o) => allowedOperationCodes.has(o.operationCode));
  const hasNoStyleOperations = !isStyleOperationsLoading && styleOperations.length === 0;

  const { data: nphPageData } = useGetNonProductiveHourCodes({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc",
    filterColumn: null, filterQuery: null,
  });
  const nphOptions = nphPageData?.items ?? [];

  const { mutateAsync: bulkSave, isPending: isSaving } = useBulkSaveDailyProductionTimeTicketMutation();

  const columns = useMemo<MRT_ColumnDef<DailyProductionTimeTicketEntry>[]>(
    () => [
      {
        accessorKey: "employeeCode",
        header: "Empl. No.",
        size: 150,
        editVariant: "select",
        editSelectOptions: employeeOptions.map((e) => ({ value: e.employeeCode, label: `${e.employeeCode} - ${e.name}` })),
        muiEditTextFieldProps: {
          select: true,
          sx: dropdownFieldSx,
          slotProps: { select: { MenuProps: dropdownSelectMenuProps } },
        },
        Cell: ({ cell }) => {
          const code = cell.getValue<string>();
          const match = employeeOptions.find((e) => e.employeeCode === code);
          return match ? `${match.employeeCode} - ${match.name}` : code;
        },
      },
      {
        accessorKey: "operationCode",
        header: "Op. Code",
        size: 200,
        editVariant: "select",
        editSelectOptions: allowedOperationOptions.map((o) => ({ value: o.operationCode, label: `${o.operationCode} - ${o.description}` })),
        muiEditTextFieldProps: {
          select: true,
          sx: dropdownFieldSx,
          slotProps: { select: { MenuProps: dropdownSelectMenuProps } },
        },
        Cell: ({ cell }) => {
          const code = cell.getValue<string>();
          const match = operationOptions.find((o) => o.operationCode === code);
          return match ? `${match.operationCode} - ${match.description}` : code;
        },
      },
      {
        accessorKey: "quantity",
        header: "Qty.",
        size: 90,
        muiEditTextFieldProps: { type: "number", sx: numberFieldNoSpinnerSx },
      },
      {
        accessorKey: "nonProductiveHourCode",
        header: "NP Code",
        size: 150,
        editVariant: "select",
        editSelectOptions: nphOptions.map((n) => ({ value: n.code, label: `${n.code} - ${n.description}` })),
        muiEditTextFieldProps: {
          select: true,
          sx: dropdownFieldSx,
          slotProps: { select: { MenuProps: dropdownSelectMenuProps } },
        },
        Cell: ({ cell }) => {
          const code = cell.getValue<string | null>();
          if (!code) return "-";
          const match = nphOptions.find((n) => n.code === code);
          return match ? `${match.code} - ${match.description}` : code;
        },
      },
      {
        accessorKey: "nonProductiveHours",
        header: "NPH",
        size: 90,
        muiEditTextFieldProps: { type: "number", sx: numberFieldNoSpinnerSx },
      },
      {
        accessorKey: "workHours",
        header: "Hrs Wrkd",
        size: 100,
        muiEditTextFieldProps: { type: "number", sx: numberFieldNoSpinnerSx },
      },
    ],
    [employeeOptions, operationOptions, allowedOperationOptions, nphOptions],
  );

  const buildRow = (values: DailyProductionTimeTicketEntry): DailyProductionTimeTicketEntry => ({
    ...scope,
    employeeCode: values.employeeCode,
    operationCode: values.operationCode,
    quantity: values.quantity,
    nonProductiveHourCode: values.nonProductiveHourCode || null,
    nonProductiveHours: values.nonProductiveHours,
    workHours: values.workHours,
  });

  const handleCreate: MRT_TableOptions<DailyProductionTimeTicketEntry>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateRow(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      setRows((prev) => [...prev, buildRow(values)]);
      table.setCreatingRow(null);
    };

  const handleSave: MRT_TableOptions<DailyProductionTimeTicketEntry>["onEditingRowSave"] =
    async ({ values, row, table }) => {
      const newValidationErrors = validateRow(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      setRows((prev) => prev.map((r, idx) => (idx === Number(row.id) ? buildRow(values) : r)));
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<DailyProductionTimeTicketEntry>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = () => {
    if (!rowToDelete) return;
    setRows((prev) => prev.filter((_, idx) => idx !== Number(rowToDelete.id)));
    setRowToDelete(null);
  };

  const handleSaveAll = async () => {
    if (rows.length === 0) {
      toast.warning("Add at least one entry before saving.");
      return;
    }
    await bulkSave({ scope, records: rows });
  };

  const table = useApparelProTable<DailyProductionTimeTicketEntry>({
    columns,
    data: rows,
    getRowId: (_row, index) => index.toString(),
    initialState: { density: "compact" },
    createDisplayMode: "row",
    editDisplayMode: "row",
    enableExpandAll: false,
    enablePagination: false,
    enableEditing: true,
    state: { isLoading },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreate,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSave,
    renderCaption: () => {
      if (Object.values(validationErrors).some(Boolean)) {
        return (
          <Box sx={{ color: "error.main", px: 2, py: 1 }}>
            {Object.values(validationErrors).filter(Boolean).join(" | ")}
          </Box>
        );
      }
      // Legacy PR_DPTT1.PRG blocks the whole screen with "Style wise
      // Operation breakdown not entered" when this happens - here the
      // Operation Code dropdown just ends up with nothing to pick, so this
      // caption is the equivalent explanation rather than a hard block.
      if (hasNoStyleOperations) {
        return (
          <Box sx={{ color: "warning.main", px: 2, py: 1 }}>
            No Style Operation Breakdown entered for this style yet - enter operations there first.
          </Box>
        );
      }
      return null;
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Button
          variant="contained"
          onClick={() =>
            table.setCreatingRow(
              createRow(table, {
                ...scope,
                employeeCode: "",
                operationCode: "",
                quantity: 0,
                nonProductiveHourCode: null,
                nonProductiveHours: 0,
                workHours: workHoursDefault,
              }),
            )
          }
          sx={primaryActionButtonSx}
        >
          <span style={themedButtonLabelStyle}>Add entry</span>
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveAll}
          disabled={isSaving}
          sx={primaryActionButtonSx}
        >
          <span style={themedButtonLabelStyle}>{isSaving ? "Saving..." : "Save"}</span>
        </Button>
      </Box>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <ModeEditOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)} sx={deleteRowIconButtonSx}>
            <DeleteForeverOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <>
      <MaterialReactTable table={table} />
      <ConfirmDialog
        open={!!rowToDelete}
        title="Remove Entry"
        message={`Remove this entry for "${rowToDelete?.original.employeeCode}"? (Not saved until you click Save.)`}
        confirmLabel="Remove"
        confirmColor="error"
        isConfirming={false}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowToDelete(null)}
      />
    </>
  );
};

export default DailyProductionTimeTicketTable;
