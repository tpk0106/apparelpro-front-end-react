// ═══════════════════════════════════════════════════════════════════════════
//  SopAdminPage.tsx — SOP Admin CRUD Page (Table + Dialog)
//  Location: src/components/ai/SopAdminPage.tsx
// ═══════════════════════════════════════════════════════════════════════════
//
// 🎓 WHAT IS THIS FILE?
// The admin page for managing Standard Operating Procedures (SOPs).
// Uses a Table + Dialog layout:
//   • Material React Table — paginated list of SOPs with edit/delete actions
//   • MUI Dialog — create/edit form with inline applicability rule management
//
// 🎓 ARCHITECTURE (from clipper-migration skill):
// Separation of Concerns:
//   • This component = UI presentation layer (rendering, form state)
//   • useSopAdmin.ts = TanStack hooks (data fetching, mutations, cache)
//   • sop.service.ts = HTTP service layer (axios calls)
//
// 🎓 APPLICABILITY RULE MANAGEMENT:
// Each SOP has 0-N applicability rules that define WHERE the SOP applies.
// The dialog includes a sub-table for managing these rules inline.
// On save, the SOP + its rules are sent in a single API call.
//
// 🎓 SOP CATEGORIES (for the category dropdown):
// These match the seed data in StandardOperatingProcedureConfig.cs:
//   Quality, Procurement, Shipping
// Users can type custom categories too.
//
// 🎓 APPLICABILITY TYPES (for the type dropdown):
// These match the applicability patterns in SopApplicabilityConfig.cs:
//   All, ReportType, Buyer, Supplier, EntityType
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
} from "material-react-table";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Typography,
  ThemeProvider,
  MenuItem,
  Chip,
} from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
// 🎓 MUI v9 — use confirmed icon names from the project's installed package
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import type { PaginationData } from "../../interfaces/definitions";
import { useApparelProTable } from "../../themes/useApparelProTable";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import ConfirmDialog from "../common/confirm-dialog";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { copperTextColor } from "../../themes/button-color-themes";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  dateIconFieldSx,
  numberFieldNoSpinnerSx,
} from "../../themes/workspace-theme";
import { asideMenuTitleTypographyTheme } from "../../themes/themes";
import {
  useGetSopsQuery,
  useCreateSopMutation,
  useUpdateSopMutation,
  useDeleteSopMutation,
} from "../../tanstack-hooks/ai/useSopAdmin";
import type {
  SopApiModel,
  CreateSopApiModel,
  UpdateSopApiModel,
  CreateSopApplicabilityApiModel,
} from "../../services/ai/sop.service";

// ─────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────

// 🎓 Copper switch styling — matches the System Parameters panel's boolean
// toggle (see system-parameters-panel.component.tsx). Uses the same
// copperTextColor (#C9803D) for both thumb and track when checked.
const copperSwitchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: copperTextColor },
  "& .MuiSwitch-switchBase.Mui-checked:hover": {
    backgroundColor: "rgba(201, 128, 61, 0.08)",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: `${copperTextColor} !important`,
  },
};

// 🎓 Predefined categories matching seed data.
// Users can also type custom values since the backend accepts any string.
const SOP_CATEGORIES = ["Quality", "Procurement", "Shipping", "Production", "Compliance"] as const;

// 🎓 Applicability types matching the SopApplicability design.
// See SopApplicabilityConfig.cs for full documentation of each type.
const APPLICABILITY_TYPES = [
  { value: "All", label: "All (Global)", hint: "Use * as key" },
  { value: "ReportType", label: "Report Type", hint: "e.g. TrimSheet" },
  { value: "Buyer", label: "Buyer", hint: "Buyer code e.g. 5" },
  { value: "Supplier", label: "Supplier", hint: "Supplier code" },
  { value: "EntityType", label: "Entity Type", hint: "e.g. Supplier, Style" },
] as const;

// 🎓 Empty form state for the create dialog.
const EMPTY_SOP_FORM: SopFormState = {
  sopCode: "",
  title: "",
  description: "",
  fullText: "",
  category: "",
  isActive: true,
  displayOrder: 0,
  effectiveFrom: new Date().toISOString().split("T")[0], // Today's date
  effectiveTo: "",
  applicabilityRules: [],
};

// ─────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────

// 🎓 Internal form state — strings for date inputs, flat rule list.
interface SopFormState {
  sopCode: string;
  title: string;
  description: string;
  fullText: string;
  category: string;
  isActive: boolean;
  displayOrder: number;
  effectiveFrom: string;
  effectiveTo: string;
  applicabilityRules: ApplicabilityRuleForm[];
}

// 🎓 Single applicability rule in the form.
interface ApplicabilityRuleForm {
  applicabilityType: string;
  applicabilityKey: string;
  isExcluded: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Component
// ═══════════════════════════════════════════════════════════════════════════

const SopAdminPage = () => {
  // 🎓 Copper dropdown theme — matches commercial invoice dialog styling.
  // useDropdownTheme provides field sx and menu props for all selects in the dialog.
  const { fieldSx, theme: dropdownTheme } = useDropdownTheme();
  const modalSelectMenuProps = {
    slotProps: {
      paper: {
        sx: {
          backgroundColor: `${dropdownTheme.panelBg} !important`,
          border: `1px solid ${dropdownTheme.panelBorder}`,
        },
      },
    },
  };
  const modalMenuItemSx = {
    color: `${dropdownTheme.optionText} !important`,
    "&:hover": { backgroundColor: `${dropdownTheme.optionHoverBg} !important` },
    "&.Mui-selected": {
      backgroundColor: `${dropdownTheme.optionSelectedBg} !important`,
      color: `${dropdownTheme.optionSelectedText} !important`,
    },
  };

  // ── Pagination state ──────────────────────────────────────────
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const paginate = useMemo<PaginationData>(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sortColumn: null,
      sortOrder: null,
      filterColumn: null,
      filterQuery: null,
    }),
    [pagination],
  );

  // ── TanStack hooks ────────────────────────────────────────────
  const { data: sopPageData, isLoading, isError } = useGetSopsQuery(paginate);
  const { mutateAsync: createSopMut, isPending: isCreating } = useCreateSopMutation();
  const { mutateAsync: updateSopMut, isPending: isUpdating } = useUpdateSopMutation();
  const { mutateAsync: deleteSopMut, isPending: isDeleting } = useDeleteSopMutation();

  const allSops = sopPageData?.items || [];
  const sopsTotal = sopPageData?.totalItems || 0;

  // ── Dialog state ──────────────────────────────────────────────
  // 🎓 null = dialog closed, 0 = create mode, >0 = edit mode (sopId)
  const [dialogSopId, setDialogSopId] = useState<number | null>(null);
  const [formState, setFormState] = useState<SopFormState>(EMPTY_SOP_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Delete confirmation state ─────────────────────────────────
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<SopApiModel> | null>(null);

  // ── Dialog handlers ───────────────────────────────────────────

  // 🎓 Open dialog for creating a NEW SOP.
  const handleOpenCreate = useCallback(() => {
    setFormState({ ...EMPTY_SOP_FORM });
    setFormErrors({});
    setDialogSopId(0);
  }, []);

  // 🎓 Open dialog for EDITING an existing SOP.
  // Pre-populates the form with the SOP's current values.
  const handleOpenEdit = useCallback((sop: SopApiModel) => {
    setFormState({
      sopCode: sop.sopCode,
      title: sop.title,
      description: sop.description,
      fullText: sop.fullText,
      category: sop.category,
      isActive: sop.isActive,
      displayOrder: sop.displayOrder,
      effectiveFrom: sop.effectiveFrom ? sop.effectiveFrom.split("T")[0] : "",
      effectiveTo: sop.effectiveTo ? sop.effectiveTo.split("T")[0] : "",
      applicabilityRules: sop.sopApplicabilities.map((rule) => ({
        applicabilityType: rule.applicabilityType,
        applicabilityKey: rule.applicabilityKey,
        isExcluded: rule.isExcluded,
      })),
    });
    setFormErrors({});
    setDialogSopId(sop.sopId);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogSopId(null);
    setFormState(EMPTY_SOP_FORM);
    setFormErrors({});
  }, []);

  // ── Form field updater ────────────────────────────────────────
  const updateField = useCallback(
    <K extends keyof SopFormState>(field: K, value: SopFormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
      // 🎓 Clear error for this field when user starts typing.
      if (formErrors[field]) {
        setFormErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [formErrors],
  );

  // ── Applicability rule handlers ───────────────────────────────

  // 🎓 Add a blank rule row to the form.
  const handleAddRule = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      applicabilityRules: [
        ...prev.applicabilityRules,
        { applicabilityType: "All", applicabilityKey: "*", isExcluded: false },
      ],
    }));
  }, []);

  // 🎓 Remove a rule by index.
  const handleRemoveRule = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      applicabilityRules: prev.applicabilityRules.filter((_, i) => i !== index),
    }));
  }, []);

  // 🎓 Update a specific field on a rule.
  const handleUpdateRule = useCallback(
    (index: number, field: keyof ApplicabilityRuleForm, value: string | boolean) => {
      setFormState((prev) => {
        const rules = [...prev.applicabilityRules];
        rules[index] = { ...rules[index], [field]: value };
        // 🎓 Auto-set key to "*" when type changes to "All"
        if (field === "applicabilityType" && value === "All") {
          rules[index].applicabilityKey = "*";
        }
        return { ...prev, applicabilityRules: rules };
      });
    },
    [],
  );

  // ── Validation ────────────────────────────────────────────────
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formState.sopCode.trim()) errors.sopCode = "SOP Code is required";
    if (!formState.title.trim()) errors.title = "Title is required";
    if (!formState.description.trim()) errors.description = "Description is required";
    if (!formState.fullText.trim()) errors.fullText = "Full text is required";
    if (!formState.category.trim()) errors.category = "Category is required";
    if (!formState.effectiveFrom) errors.effectiveFrom = "Effective From is required";

    // 🎓 Validate applicability rules
    formState.applicabilityRules.forEach((rule, index) => {
      if (!rule.applicabilityType) {
        errors[`rule_${index}_type`] = "Type is required";
      }
      if (!rule.applicabilityKey.trim()) {
        errors[`rule_${index}_key`] = "Key is required";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formState]);

  // ── Save handler ──────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    // 🎓 Map form state → API model for applicability rules.
    const rules: CreateSopApplicabilityApiModel[] = formState.applicabilityRules.map(
      (rule) => ({
        applicabilityType: rule.applicabilityType,
        applicabilityKey: rule.applicabilityKey,
        isExcluded: rule.isExcluded,
      }),
    );

    if (dialogSopId === 0) {
      // 🎓 CREATE mode
      const createModel: CreateSopApiModel = {
        sopCode: formState.sopCode.trim().toUpperCase(),
        title: formState.title.trim(),
        description: formState.description.trim(),
        fullText: formState.fullText.trim(),
        category: formState.category.trim(),
        isActive: formState.isActive,
        displayOrder: formState.displayOrder,
        effectiveFrom: formState.effectiveFrom,
        effectiveTo: formState.effectiveTo || null,
        sopApplicabilities: rules,
      };
      await createSopMut(createModel);
    } else if (dialogSopId && dialogSopId > 0) {
      // 🎓 UPDATE mode
      const updateModel: UpdateSopApiModel = {
        sopId: dialogSopId,
        sopCode: formState.sopCode.trim().toUpperCase(),
        title: formState.title.trim(),
        description: formState.description.trim(),
        fullText: formState.fullText.trim(),
        category: formState.category.trim(),
        isActive: formState.isActive,
        displayOrder: formState.displayOrder,
        effectiveFrom: formState.effectiveFrom,
        effectiveTo: formState.effectiveTo || null,
        sopApplicabilities: rules,
      };
      await updateSopMut(updateModel);
    }

    handleCloseDialog();
  }, [
    dialogSopId,
    formState,
    validateForm,
    createSopMut,
    updateSopMut,
    handleCloseDialog,
  ]);

  // ── Delete handlers ───────────────────────────────────────────
  const handleConfirmDelete = useCallback(async () => {
    if (!rowToDelete) return;
    await deleteSopMut(rowToDelete.original.sopId);
    setRowToDelete(null);
  }, [rowToDelete, deleteSopMut]);

  const handleCancelDelete = useCallback(() => {
    setRowToDelete(null);
  }, []);

  // ── Table columns ─────────────────────────────────────────────
  // 🎓 Column definitions for the SOP table.
  // Uses useMemo to prevent unnecessary re-renders (from clipper-migration skill).
  const columns = useMemo<MRT_ColumnDef<SopApiModel>[]>(
    () => [
      {
        accessorKey: "sopCode",
        header: "SOP Code",
        size: 140,
        enableEditing: false,
        enableSorting: false,
        Cell: ({ renderedCellValue }) => (
          <Box sx={{ display: "flex" }}>
            <span style={{ fontWeight: 600 }}>
              {renderedCellValue?.toString().toUpperCase()}
            </span>
          </Box>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        size: 280,
        enableEditing: false,
        enableSorting: false,
      },
      {
        accessorKey: "category",
        header: "Category",
        size: 120,
        enableEditing: false,
        enableSorting: false,
        Cell: ({ renderedCellValue }) => (
          <Chip
            label={renderedCellValue}
            size="small"
            variant="outlined"
            sx={{ borderColor: DASHBOARD_COLORS.accentStrong, color: DASHBOARD_COLORS.accentStrong }}
          />
        ),
      },
      {
        accessorKey: "isActive",
        header: "Active",
        size: 80,
        enableEditing: false,
        enableSorting: false,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<boolean>() ? "Active" : "Inactive"}
            size="small"
            color={cell.getValue<boolean>() ? "success" : "default"}
          />
        ),
      },
      {
        accessorKey: "effectiveFrom",
        header: "Effective From",
        size: 130,
        enableEditing: false,
        enableSorting: false,
        Cell: ({ cell }) => {
          const val = cell.getValue<string>();
          return val ? new Date(val).toLocaleDateString() : "—";
        },
      },
      {
        accessorKey: "effectiveTo",
        header: "Effective To",
        size: 130,
        enableEditing: false,
        enableSorting: false,
        Cell: ({ cell }) => {
          const val = cell.getValue<string | null>();
          return val ? new Date(val).toLocaleDateString() : "No expiry";
        },
      },
      {
        accessorKey: "displayOrder",
        header: "Order",
        size: 70,
        enableEditing: false,
        enableSorting: false,
      },
      {
        accessorKey: "createdBy",
        header: "Created By",
        size: 130,
        enableEditing: false,
        enableSorting: false,
      },
    ],
    [],
  );

  // ── Table instance ────────────────────────────────────────────
  // 🎓 Uses useApparelProTable for consistent styling across the app.
  const table = useApparelProTable<SopApiModel>({
    columns,
    data: allSops,

    initialState: {
      density: "compact",
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },

    // 🎓 Disable inline editing — we use a Dialog instead.
    // enableRowActions: true is REQUIRED for renderRowActions to display
    // the Edit/Delete icon buttons column. Without it, MRT silently
    // ignores renderRowActions (see commercial-invoice-list for precedent).
    enableEditing: true,
    enableRowActions: true,
    editDisplayMode: "custom",
    createDisplayMode: "custom",

    // ── Pagination ──────────────────────────────────────────────
    rowCount: sopsTotal,
    manualPagination: true,
    paginationDisplayMode: "pages",
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [5, 10, 20],
      shape: "rounded",
      variant: "outlined",
    },
    onPaginationChange: setPagination,

    state: {
      pagination: pagination,
      showAlertBanner: isError,
      isLoading: isLoading,
      showProgressBars: isCreating || isUpdating || isDeleting,
    },

    // ── Toolbar ─────────────────────────────────────────────────
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleOpenCreate}
        sx={primaryActionButtonSx}
      >
        <span style={themedButtonLabelStyle}>New SOP</span>
      </Button>
    ),

    // ── Row Actions ─────────────────────────────────────────────
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => handleOpenEdit(row.original)}>
            <ModeEditOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => setRowToDelete(row)}>
            <DeleteForeverOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),

    // ── Loading caption ─────────────────────────────────────────
    renderCaption: () => {
      if (isLoading) {
        return (
          <div className="text-sky-400 flex justify-center py-2">
            Loading SOPs...
          </div>
        );
      }
      if (isCreating || isUpdating) {
        return (
          <div className="text-amber-400 flex justify-center py-2">
            Saving SOP...
          </div>
        );
      }
      if (isDeleting) {
        return (
          <div className="text-red-400 flex justify-center py-2">
            Deleting SOP...
          </div>
        );
      }
      return null;
    },
  });

  // ═════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════

  return (
    <div
      className="flex flex-col w-[95%] mx-auto justify-around mt-10"
      style={{
        backgroundColor: DASHBOARD_COLORS.pageBg,
        borderRadius: 16,
        padding: "1.5rem",
      }}
    >
      {/* ── Page Title ──────────────────────────────────────────── */}
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography
            sx={{
              color: DASHBOARD_COLORS.accentStrong,
              textShadow: "0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(0,0,0,0.4)",
            }}
          >
            STANDARD OPERATING PROCEDURES
          </Typography>
        </ThemeProvider>
      </div>

      {/* ── SOP Table ───────────────────────────────────────────── */}
      <MaterialReactTable table={table} />

      {/* ── Delete Confirm Dialog ───────────────────────────────── */}
      {/* 🎓 Delete confirmation — uses the shared ConfirmDialog component
          from components/common/confirm-dialog.tsx. The dialog locks its
          buttons and blocks Escape/backdrop dismiss while the delete
          request is in flight (isConfirming=isDeleting). */}
      <ConfirmDialog
        open={!!rowToDelete}
        title="Delete SOP"
        message={`Are you sure you want to delete "${rowToDelete?.original.sopCode} — ${rowToDelete?.original.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* ── Create / Edit Dialog ────────────────────────────────── */}
      {/* 🎓 The dialog opens when dialogSopId is not null:
           • dialogSopId === 0  → Create mode
           • dialogSopId > 0    → Edit mode (pre-populated)
      */}
      <Dialog
        open={dialogSopId !== null}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundColor: DASHBOARD_COLORS.cardBg,
              border: `1px solid ${DASHBOARD_COLORS.border}`,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.accentStrong }}>
          {dialogSopId === 0
            ? "Create New SOP (Standard Operating Procedure)"
            : "Edit SOP (Standard Operating Procedure)"}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: DASHBOARD_COLORS.border }}>
          {/* ── Row 1: SOP Code + Category ─────────────────────── */}
          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <TextField
              label="SOP Code"
              value={formState.sopCode}
              onChange={(e) => updateField("sopCode", e.target.value.toUpperCase())}
              error={!!formErrors.sopCode}
              helperText={formErrors.sopCode}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { style: { textTransform: "uppercase" } } }}
              sx={{ ...(fieldSx as Record<string, unknown>), flex: 1 }}
            />
            <TextField
              label="Category"
              value={formState.category}
              onChange={(e) => updateField("category", e.target.value)}
              error={!!formErrors.category}
              helperText={formErrors.category}
              select
              fullWidth
              size="small"
              sx={{ ...(fieldSx as Record<string, unknown>), flex: 1 }}
              slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
            >
              {SOP_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat} sx={modalMenuItemSx}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* ── Row 2: Title ──────────────────────────────────── */}
          <TextField
            label="Title"
            value={formState.title}
            onChange={(e) => updateField("title", e.target.value)}
            error={!!formErrors.title}
            helperText={formErrors.title}
            fullWidth
            size="small"
            sx={{ ...(fieldSx as Record<string, unknown>), mt: 2 }}
          />

          {/* ── Row 3: Description ────────────────────────────── */}
          <TextField
            label="Description"
            value={formState.description}
            onChange={(e) => updateField("description", e.target.value)}
            error={!!formErrors.description}
            helperText={formErrors.description}
            fullWidth
            size="small"
            multiline
            rows={2}
            sx={{ ...(fieldSx as Record<string, unknown>), mt: 2 }}
          />

          {/* ── Row 4: Full Text ──────────────────────────────── */}
          {/* 🎓 The full SOP text that gets embedded into the RAG
              vector store and injected into PDF reports.
              Multi-line with more rows for longer content. */}
          <TextField
            label="Full Text (SOP Content)"
            value={formState.fullText}
            onChange={(e) => updateField("fullText", e.target.value)}
            error={!!formErrors.fullText}
            helperText={formErrors.fullText || "This text is embedded in the RAG vector store and appears in PDF reports"}
            fullWidth
            size="small"
            multiline
            rows={5}
            sx={{ ...(fieldSx as Record<string, unknown>), mt: 2 }}
          />

          {/* ── Row 5: Dates + Order + Active ────────────────── */}
          {/* 🎓 ALIGNMENT FIX: Uses alignItems:"flex-start" so all fields
              align by their TOP edge. Both date fields always render a
              helperText line (a non-breaking space " " when no real text
              is needed) so they stay the same height regardless of whether
              a validation error is showing on Effective From. Without this,
              MUI's helperText adds ~20px below one field but not the other,
              pushing them out of alignment. */}
          <Box sx={{ display: "flex", gap: 2, mt: 2, alignItems: "flex-start" }}>
            <TextField
              label="Effective From"
              type="date"
              value={formState.effectiveFrom}
              onChange={(e) => updateField("effectiveFrom", e.target.value)}
              error={!!formErrors.effectiveFrom}
              helperText={formErrors.effectiveFrom || " "}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), flex: 1 }}
            />
            <TextField
              label="Effective To"
              type="date"
              value={formState.effectiveTo}
              onChange={(e) => updateField("effectiveTo", e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), flex: 1 }}
              helperText="Leave empty for no expiry"
            />
            <TextField
              label="Display Order"
              type="number"
              value={formState.displayOrder}
              onChange={(e) =>
                updateField("displayOrder", parseInt(e.target.value) || 0)
              }
              size="small"
              sx={{ ...(fieldSx as Record<string, unknown>), ...(numberFieldNoSpinnerSx as Record<string, unknown>), flex: 0.5 }}
            />
            {/* 🎓 Active switch — copper color matching System Parameters panel.
                Uses copperSwitchSx for consistent copper toggle appearance
                across all admin screens (see system-parameters-panel). */}
            <FormControlLabel
              control={
                <Switch
                  checked={formState.isActive}
                  onChange={(e) => updateField("isActive", e.target.checked)}
                  sx={copperSwitchSx}
                />
              }
              label="Active"
              sx={{ flex: 0.5, "& .MuiFormControlLabel-label": { color: DASHBOARD_COLORS.textPrimary } }}
            />
          </Box>

          {/* ── Applicability Rules Section ───────────────────── */}
          {/* 🎓 This sub-section manages the SopApplicability child records.
              Each rule defines WHERE the SOP applies (or is excluded). */}
          <Box sx={{ mt: 3, mb: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: DASHBOARD_COLORS.accentStrong }}
              >
                Applicability Rules
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRule}
                sx={primaryActionButtonSx}
              >
                <span style={themedButtonLabelStyle}>Add Rule</span>
              </Button>
            </Box>

            {/* 🎓 Hint text explaining the rule system */}
            {formState.applicabilityRules.length === 0 && (
              <Typography
                variant="body2"
                sx={{ color: "#8B93A1", fontStyle: "italic", mb: 1 }}
              >
                No rules defined. This SOP won't appear in any context until
                rules are added.
              </Typography>
            )}

            {/* 🎓 Render each rule as a row of inputs */}
            {formState.applicabilityRules.map((rule, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: "rgba(191,168,90,0.06)",
                  border: `1px solid ${DASHBOARD_COLORS.border}`,
                }}
              >
                {/* Applicability Type dropdown */}
                <TextField
                  select
                  label="Type"
                  value={rule.applicabilityType}
                  onChange={(e) =>
                    handleUpdateRule(index, "applicabilityType", e.target.value)
                  }
                  size="small"
                  error={!!formErrors[`rule_${index}_type`]}
                  sx={{ ...(fieldSx as Record<string, unknown>), flex: 1 }}
                  slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
                >
                  {APPLICABILITY_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value} sx={modalMenuItemSx}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Applicability Key input */}
                <TextField
                  label="Key"
                  value={rule.applicabilityKey}
                  onChange={(e) =>
                    handleUpdateRule(index, "applicabilityKey", e.target.value)
                  }
                  size="small"
                  error={!!formErrors[`rule_${index}_key`]}
                  placeholder={
                    APPLICABILITY_TYPES.find(
                      (t) => t.value === rule.applicabilityType,
                    )?.hint || ""
                  }
                  sx={{ ...(fieldSx as Record<string, unknown>), flex: 1 }}
                  disabled={rule.applicabilityType === "All"}
                />

                {/* IsExcluded toggle */}
                {/* 🎓 When true, this rule EXCLUDES the SOP from this context.
                    Used for negative overrides: "applies globally EXCEPT buyer 205" */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={rule.isExcluded}
                      onChange={(e) =>
                        handleUpdateRule(index, "isExcluded", e.target.checked)
                      }
                      color="error"
                      size="small"
                    />
                  }
                  label={
                    <Typography
                      variant="caption"
                      sx={{
                        color: rule.isExcluded ? "#ef4444" : "#8B93A1",
                        fontWeight: rule.isExcluded ? 600 : 400,
                      }}
                    >
                      {rule.isExcluded ? "EXCLUDE" : "Include"}
                    </Typography>
                  }
                  sx={{ mx: 0, minWidth: 100 }}
                />

                {/* Remove rule button */}
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveRule(index)}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} variant="contained" sx={primaryActionButtonSx}>
            <span style={themedButtonLabelStyle}>Cancel</span>
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isCreating || isUpdating}
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>
              {isCreating || isUpdating
                ? "Saving..."
                : dialogSopId === 0
                  ? "Create SOP"
                  : "Update SOP"}
            </span>
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SopAdminPage;
