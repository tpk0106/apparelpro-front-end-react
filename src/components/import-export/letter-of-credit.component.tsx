import { useEffect, useState } from "react";
import {
  Box, Button, Checkbox, CircularProgress, FormControlLabel, IconButton,
  MenuItem, TextField, Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import {
  primaryActionButtonSx, themedButtonLabelStyle, numberFieldNoSpinnerSx, dateIconFieldSx, workspaceHeadingSx,
  workspaceSectionLabelSx,
} from "../../themes/workspace-theme";
import {
  useGetBuyersQuery, useGetCurrenciesQuery, useGetDestinations, useGetCountriesQuery,
  useGetBanksQuery, useGetSuppliersLookup,
} from "../../tanstack-hooks/custom-hooks";
import {
  useGetLetterOfCredit, useSaveLetterOfCredit, useDeleteLetterOfCredit,
} from "../../tanstack-hooks/import-export/letter-of-credit.hooks";
import ConfirmDialog from "../common/confirm-dialog";
import type { LetterOfCreditHeader, LetterOfCreditLine } from "../../interfaces/import-export/ImportExport";

const BANK_OPTIONS = [
  { code: "BOC", label: "BOC - Bank of Ceylon" },
  { code: "SCB", label: "SCB - Standard Chartered Bank" },
  { code: "PB ", label: "PB - Peoples Bank" },
];

const emptyHeader = (bankCode: string, lcNo: string): LetterOfCreditHeader => ({
  bankCode, lcNo,
  creditNo: "", expiryDate: null, expiryPlaceCode: "", openingDate: null,
  beneficiaryCode: null, issuedBy: "", notifyPartyCode: "", licenceType: "", licenceNo: "",
  transferableCredit: null, confirmedCredit: "", partShipment: "", transhipment: "",
  insuranceCoverage: null, shipmentTerm: "", shipmentTermOther: "", billOfLadingIssued: null,
  freightPayment: "", airwayDocumentType: "", additionalConditions: null, extraConditions: null,
  creditBy: "", beneficiaryDraft: "", insuranceClause: "", countryOfOriginCode: "",
  shipmentFromCode: "", transportTo: "", insurancePercent: null, insuranceValueCurrency: "",
  certifiedMailCopies: "", documentPresentationDays: "", shipmentTermCustomLabel: "",
  accountNo: "", branch: "", creditAvailableWith: "", creditDocuments: "", conformityWith: "",
  insuranceRemarks: "", tenorDays: "", drawnOn: "", ciCopies: "", tenorDate: null,
  notLaterThanDate: null, beneficiaryCountryCode: "", advisingBankCode: "", invoiceSelection: "",
  packingSpecification: "", marineBillOfLading: "", marineBillOfLadingConsignee: "",
  airWaybill: "", airWaybillConsignee: "", otherDocuments: "", bankSentTo: "",
  importPermitNo: "", importContractNo: "", incomeTaxNo: "", bttReferenceNo: "", importValidityDate: null,
});

const emptyLine = (bankCode: string, lcNo: string): Omit<LetterOfCreditLine, "id"> => ({
  bankCode, lcNo, itemCode: "", description: "", unit: "", quantity: 0, currency: "", unitPrice: 0, btnNo: "",
});

// Matches legacy IE_LCBC1.PRG - ie_lc.dbf is one flat table shared across
// BOC/SCB/Peoples Bank (the legacy screen just shows/labels a different
// subset of the same fields per bank via its tom/dick/duck functions), so
// this is one unified form rather than three separate layouts. Coded flags
// (A/B/C/D, X/blank) render as dropdowns/checkboxes with real labels but
// save as the same single-char codes underneath, per the option 2 confirmed
// this session (label text is illustrative of the option's real meaning,
// not necessarily identical wording across all three legacy bank screens).
const LetterOfCreditPage = () => {
  const { fieldSx, listboxSx } = useDropdownTheme();
  const modalSelectMenuProps = { select: { MenuProps: { slotProps: { paper: { sx: listboxSx } } } } };

  const [bankCode, setBankCode] = useState("BOC");
  const [lcNoInput, setLcNoInput] = useState("");
  const [activeLcNo, setActiveLcNo] = useState<string | null>(null);

  const { data: buyersPage } = useGetBuyersQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "name", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const buyers = buyersPage?.items ?? [];
  const { data: currenciesPage } = useGetCurrenciesQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const currencies = currenciesPage?.items ?? [];
  const { data: portsPage } = useGetDestinations({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const ports = portsPage?.items ?? [];
  const { data: countriesPage } = useGetCountriesQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "name", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const countries = countriesPage?.items ?? [];
  const { data: banksPage } = useGetBanksQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "bankCode", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const banks = banksPage?.items ?? [];
  const { data: suppliers } = useGetSuppliersLookup();

  const { data: existing, isFetching: isLoadingExisting } = useGetLetterOfCredit(bankCode, activeLcNo);
  const saveMutation = useSaveLetterOfCredit();
  const deleteMutation = useDeleteLetterOfCredit();

  const [header, setHeader] = useState<LetterOfCreditHeader>(emptyHeader(bankCode, ""));
  const [lines, setLines] = useState<Omit<LetterOfCreditLine, "id">[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!activeLcNo) return;
    if (existing) {
      setHeader(existing.header);
      setLines(existing.lines);
    } else {
      setHeader(emptyHeader(bankCode, activeLcNo));
      setLines([]);
    }
  }, [existing, bankCode, activeLcNo]);

  const handleLoad = () => {
    const trimmed = lcNoInput.trim();
    if (!trimmed) {
      toast.error("Enter an L/C Number first.");
      return;
    }
    setActiveLcNo(trimmed);
  };

  const setField = <K extends keyof LetterOfCreditHeader>(field: K, value: LetterOfCreditHeader[K]) => {
    setHeader((p) => ({ ...p, [field]: value }));
  };

  const handleAddLine = () => setLines((p) => [...p, emptyLine(bankCode, activeLcNo ?? "")]);
  const handleLineChange = (
    index: number, field: keyof Omit<LetterOfCreditLine, "id" | "bankCode" | "lcNo">, value: string | number,
  ) => setLines((p) => p.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  const handleDeleteLine = (index: number) => setLines((p) => p.filter((_, i) => i !== index));

  const handleSave = () => {
    if (!activeLcNo) {
      toast.error("Load or enter an L/C Number first.");
      return;
    }
    saveMutation.mutate(
      { header: { ...header, bankCode, lcNo: activeLcNo }, lines: lines.map((l) => ({ ...l, id: 0, bankCode, lcNo: activeLcNo })) },
      {
        onSuccess: () => toast.success("Letter of Credit saved."),
        onError: (error) => toast.error(error.message || "Failed to save Letter of Credit."),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!activeLcNo) return;
    deleteMutation.mutate({ bankCode, lcNo: activeLcNo }, {
      onSuccess: () => {
        toast.success("Letter of Credit deleted.");
        setIsDeleteConfirmOpen(false);
        setActiveLcNo(null);
        setLcNoInput("");
      },
      onError: (error) => toast.error(error.message || "Failed to delete Letter of Credit."),
    });
  };

  const checkboxField = (label: string, field: keyof LetterOfCreditHeader) => (
    <FormControlLabel
      control={
        <Checkbox
          checked={header[field] === "X"}
          onChange={(e) => setField(field, (e.target.checked ? "X" : null) as never)}
        />
      }
      label={label}
    />
  );

  return (
    <div className="flex flex-col w-[90%] mx-auto justify-around mt-10 mb-12">
      <Typography sx={workspaceHeadingSx}>Letter of Credit (L/C) Form</Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 3, mb: 3 }}>
        <TextField
          select label="Bank" size="small" sx={{ ...fieldSx, width: 260 }}
          slotProps={modalSelectMenuProps}
          value={bankCode}
          onChange={(e) => { setBankCode(e.target.value); setActiveLcNo(null); }}
        >
          {BANK_OPTIONS.map((b) => (
            <MenuItem key={b.code} value={b.code}>{b.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="L/C No." size="small" sx={{ ...fieldSx, width: 260 }}
          value={lcNoInput} onChange={(e) => setLcNoInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleLoad(); }}
        />
        <Button variant="contained" sx={primaryActionButtonSx} onClick={handleLoad}>
          <span style={themedButtonLabelStyle}>Load / New</span>
        </Button>
      </Box>

      {activeLcNo && (
        isLoadingExisting ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 4, justifyContent: "center" }}>
            <CircularProgress size={22} />
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Loading...</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="subtitle2" sx={{ ...workspaceSectionLabelSx, mt: 1 }}>Identification</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <TextField label="Credit No." size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.creditNo || ""} onChange={(e) => setField("creditNo", e.target.value)} />
              <TextField type="date" label="Opening Date" size="small"
                sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), width: 200 }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={header.openingDate?.split("T")[0] || ""} onChange={(e) => setField("openingDate", e.target.value || null)} />
              <TextField type="date" label="Expiry Date" size="small"
                sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), width: 200 }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={header.expiryDate?.split("T")[0] || ""} onChange={(e) => setField("expiryDate", e.target.value || null)} />
              <TextField select label="Expiry Place" size="small" sx={{ ...fieldSx, width: 220 }} slotProps={modalSelectMenuProps}
                value={header.expiryPlaceCode || ""} onChange={(e) => setField("expiryPlaceCode", e.target.value)}>
                {ports.map((p) => <MenuItem key={p.code} value={p.code}>{p.code} - {p.destinationName}</MenuItem>)}
              </TextField>
              <TextField select label="Issued By" size="small" sx={{ ...fieldSx, width: 300 }} slotProps={modalSelectMenuProps}
                value={header.issuedBy || ""} onChange={(e) => setField("issuedBy", e.target.value)}>
                <MenuItem value="A">A. Airmail</MenuItem>
                <MenuItem value="B">B. With brief advice by telex/cable</MenuItem>
                <MenuItem value="C">C. Telex/cable followed by airmail conf.</MenuItem>
                <MenuItem value="D">D. Telex/cable</MenuItem>
              </TextField>
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Parties</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <TextField select label="Beneficiary (Supplier)" size="small" sx={{ ...fieldSx, width: 280 }} slotProps={modalSelectMenuProps}
                value={header.beneficiaryCode || ""} onChange={(e) => setField("beneficiaryCode", Number(e.target.value))}>
                {(suppliers ?? []).map((s) => <MenuItem key={s.supplierCode} value={s.supplierCode}>{s.supplierCode} - {s.name}</MenuItem>)}
              </TextField>
              <TextField select label="Notify Party" size="small" sx={{ ...fieldSx, width: 280 }} slotProps={modalSelectMenuProps}
                value={header.notifyPartyCode || ""} onChange={(e) => setField("notifyPartyCode", e.target.value)}>
                {buyers.map((b) => <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>{b.buyerCode} - {b.name}</MenuItem>)}
              </TextField>
              <TextField select label="Advising Bank" size="small" sx={{ ...fieldSx, width: 240 }} slotProps={modalSelectMenuProps}
                value={header.advisingBankCode || ""} onChange={(e) => setField("advisingBankCode", e.target.value)}>
                {banks.map((b) => <MenuItem key={b.bankCode} value={b.bankCode}>{b.bankCode} - {b.name}</MenuItem>)}
              </TextField>
              <TextField select label="Beneficiary Country" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.beneficiaryCountryCode || ""} onChange={(e) => setField("beneficiaryCountryCode", e.target.value)}>
                {countries.map((c) => <MenuItem key={c.id} value={c.code}>{c.code} - {c.name}</MenuItem>)}
              </TextField>
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Credit Terms</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
              {checkboxField("Transferable Credit", "transferableCredit")}
              <TextField select label="Confirmed Credit" size="small" sx={{ ...fieldSx, width: 220 }} slotProps={modalSelectMenuProps}
                value={header.confirmedCredit || ""} onChange={(e) => setField("confirmedCredit", e.target.value)}>
                <MenuItem value="A">A. Confirmed</MenuItem>
                <MenuItem value="B">B. Unconfirmed</MenuItem>
                <MenuItem value="C">C. Irrevocable</MenuItem>
                <MenuItem value="D">D. Revocable</MenuItem>
              </TextField>
              <TextField select label="Credit By" size="small" sx={{ ...fieldSx, width: 220 }} slotProps={modalSelectMenuProps}
                value={header.creditBy || ""} onChange={(e) => setField("creditBy", e.target.value)}>
                <MenuItem value="A">A. By Payment</MenuItem>
                <MenuItem value="B">B. By Acceptance</MenuItem>
                <MenuItem value="C">C. By Negotiation</MenuItem>
              </TextField>
              <TextField select label="Beneficiary Draft" size="small" sx={{ ...fieldSx, width: 200 }} slotProps={modalSelectMenuProps}
                value={header.beneficiaryDraft || ""} onChange={(e) => setField("beneficiaryDraft", e.target.value)}>
                <MenuItem value="A">A. Sight</MenuItem>
                <MenuItem value="B">B. Other (tenor)</MenuItem>
              </TextField>
              {header.beneficiaryDraft === "B" && (
                <>
                  <TextField label="Tenor Days" size="small" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 130 }}
                    value={header.tenorDays || ""} onChange={(e) => setField("tenorDays", e.target.value)} />
                  <TextField type="date" label="Tenor From Date" size="small"
                    sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), width: 200 }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={header.tenorDate?.split("T")[0] || ""} onChange={(e) => setField("tenorDate", e.target.value || null)} />
                </>
              )}
              <TextField label="Drawn On" size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.drawnOn || ""} onChange={(e) => setField("drawnOn", e.target.value)} />
              <TextField label="Credit Available With" size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.creditAvailableWith || ""} onChange={(e) => setField("creditAvailableWith", e.target.value)} />
              <TextField label="Credit Documents" size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.creditDocuments || ""} onChange={(e) => setField("creditDocuments", e.target.value)} />
              <TextField label="Licence Type" size="small" sx={{ ...fieldSx, width: 160 }}
                value={header.licenceType || ""} onChange={(e) => setField("licenceType", e.target.value)} />
              <TextField label="Licence No." size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.licenceNo || ""} onChange={(e) => setField("licenceNo", e.target.value)} />
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Shipment</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <TextField select label="Part Shipment" size="small" sx={{ ...fieldSx, width: 200 }} slotProps={modalSelectMenuProps}
                value={header.partShipment || ""} onChange={(e) => setField("partShipment", e.target.value)}>
                <MenuItem value="A">A. Allowed</MenuItem>
                <MenuItem value="B">B. Not Allowed</MenuItem>
              </TextField>
              <TextField select label="Transhipment" size="small" sx={{ ...fieldSx, width: 200 }} slotProps={modalSelectMenuProps}
                value={header.transhipment || ""} onChange={(e) => setField("transhipment", e.target.value)}>
                <MenuItem value="A">A. Allowed</MenuItem>
                <MenuItem value="B">B. Not Allowed</MenuItem>
              </TextField>
              <TextField select label="Shipment Term" size="small" sx={{ ...fieldSx, width: 200 }} slotProps={modalSelectMenuProps}
                value={header.shipmentTerm || ""} onChange={(e) => setField("shipmentTerm", e.target.value)}>
                <MenuItem value="A">A. FOB</MenuItem>
                <MenuItem value="B">B. C&amp;F</MenuItem>
                <MenuItem value="C">C. CIF</MenuItem>
                <MenuItem value="D">D. Other Terms</MenuItem>
              </TextField>
              {header.shipmentTerm === "D" && (
                <TextField label="Other Term Label" size="small" sx={{ ...fieldSx, width: 180 }}
                  value={header.shipmentTermCustomLabel || ""} onChange={(e) => setField("shipmentTermCustomLabel", e.target.value)} />
              )}
              <TextField select label="Shipment From" size="small" sx={{ ...fieldSx, width: 220 }} slotProps={modalSelectMenuProps}
                value={header.shipmentFromCode || ""} onChange={(e) => setField("shipmentFromCode", e.target.value)}>
                {ports.map((p) => <MenuItem key={p.code} value={p.code}>{p.code} - {p.destinationName}</MenuItem>)}
              </TextField>
              <TextField label="Transport To" size="small" sx={{ ...fieldSx, width: 260 }}
                value={header.transportTo || ""} onChange={(e) => setField("transportTo", e.target.value)} />
              <TextField type="date" label="Not Later Than" size="small"
                sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), width: 200 }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={header.notLaterThanDate?.split("T")[0] || ""} onChange={(e) => setField("notLaterThanDate", e.target.value || null)} />
              <TextField select label="Freight Payment" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.freightPayment || ""} onChange={(e) => setField("freightPayment", e.target.value)}>
                <MenuItem value="A">A. Freight Prepaid</MenuItem>
                <MenuItem value="B">B. Freight Payable at Destination</MenuItem>
              </TextField>
              <TextField select label="Airway Document Type" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.airwayDocumentType || ""} onChange={(e) => setField("airwayDocumentType", e.target.value)}>
                <MenuItem value="A">A. Air Waybill</MenuItem>
                <MenuItem value="B">B. Parcel Post Receipt</MenuItem>
                <MenuItem value="C">C. Air Parcel Post Receipt</MenuItem>
                <MenuItem value="D">D. Tindal's Receipt</MenuItem>
              </TextField>
              <TextField label="Packing Specification" size="small" sx={{ ...fieldSx, width: 200 }}
                value={header.packingSpecification || ""} onChange={(e) => setField("packingSpecification", e.target.value)} />
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Insurance</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
              {checkboxField("Insurance Coverage", "insuranceCoverage")}
              <TextField label="Insurance %" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 130 }}
                value={header.insurancePercent ?? ""} onChange={(e) => setField("insurancePercent", e.target.value === "" ? null : Number(e.target.value))} />
              <TextField select label="Insurance Value Currency" size="small" sx={{ ...fieldSx, width: 220 }} slotProps={modalSelectMenuProps}
                value={header.insuranceValueCurrency || ""} onChange={(e) => setField("insuranceValueCurrency", e.target.value)}>
                {currencies.map((c) => <MenuItem key={c.id} value={c.code}>{c.code} - {c.name}</MenuItem>)}
              </TextField>
              <TextField label="Insurance Clause" size="small" sx={{ ...fieldSx, width: 160 }}
                value={header.insuranceClause || ""} onChange={(e) => setField("insuranceClause", e.target.value)} />
              <TextField label="Insurance Remarks" size="small" fullWidth sx={{ ...fieldSx, minWidth: 300 }}
                value={header.insuranceRemarks || ""} onChange={(e) => setField("insuranceRemarks", e.target.value)} />
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Documents</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
              {checkboxField("Bill of Lading Issued", "billOfLadingIssued")}
              <TextField select label="Invoice Selection" size="small" sx={{ ...fieldSx, width: 280 }} slotProps={modalSelectMenuProps}
                value={header.invoiceSelection || ""} onChange={(e) => setField("invoiceSelection", e.target.value)}>
                <MenuItem value="A">A. Certified Customs Invoices</MenuItem>
                <MenuItem value="B">B. Signed Commercial Invoices</MenuItem>
              </TextField>
              <TextField label="CI Copies" size="small" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 110 }}
                value={header.ciCopies || ""} onChange={(e) => setField("ciCopies", e.target.value)} />
              <TextField label="Doc. Presentation Days" size="small" sx={{ ...fieldSx, width: 180 }}
                value={header.documentPresentationDays || ""} onChange={(e) => setField("documentPresentationDays", e.target.value)} />
              <TextField label="Certified Mail Copies" size="small" sx={{ ...fieldSx, width: 180 }}
                value={header.certifiedMailCopies || ""} onChange={(e) => setField("certifiedMailCopies", e.target.value)} />
              <TextField select label="Country of Origin" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.countryOfOriginCode || ""} onChange={(e) => setField("countryOfOriginCode", e.target.value)}>
                {countries.map((c) => <MenuItem key={c.id} value={c.code}>{c.code} - {c.name}</MenuItem>)}
              </TextField>
              <TextField label="Conformity With" size="small" fullWidth sx={{ ...fieldSx, minWidth: 300 }}
                value={header.conformityWith || ""} onChange={(e) => setField("conformityWith", e.target.value)} />
              <TextField label="Marine B/L" size="small" fullWidth sx={{ ...fieldSx, minWidth: 280 }}
                value={header.marineBillOfLading || ""} onChange={(e) => setField("marineBillOfLading", e.target.value)} />
              <TextField label="Marine B/L Consignee" size="small" fullWidth sx={{ ...fieldSx, minWidth: 280 }}
                value={header.marineBillOfLadingConsignee || ""} onChange={(e) => setField("marineBillOfLadingConsignee", e.target.value)} />
              <TextField label="Air Waybill" size="small" fullWidth sx={{ ...fieldSx, minWidth: 280 }}
                value={header.airWaybill || ""} onChange={(e) => setField("airWaybill", e.target.value)} />
              <TextField label="Air Waybill Consignee" size="small" fullWidth sx={{ ...fieldSx, minWidth: 280 }}
                value={header.airWaybillConsignee || ""} onChange={(e) => setField("airWaybillConsignee", e.target.value)} />
              <TextField label="Other Documents" size="small" fullWidth sx={{ ...fieldSx, minWidth: 280 }}
                value={header.otherDocuments || ""} onChange={(e) => setField("otherDocuments", e.target.value)} />
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Bank / Admin</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
              {checkboxField("Additional Conditions", "additionalConditions")}
              {checkboxField("Extra Conditions", "extraConditions")}
              <TextField label="Account No." size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.accountNo || ""} onChange={(e) => setField("accountNo", e.target.value)} />
              <TextField label="Branch" size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.branch || ""} onChange={(e) => setField("branch", e.target.value)} />
              <TextField label="Bank Sent To" size="small" fullWidth sx={{ ...fieldSx, minWidth: 300 }}
                value={header.bankSentTo || ""} onChange={(e) => setField("bankSentTo", e.target.value)} />
              <TextField label="Import Permit No." size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.importPermitNo || ""} onChange={(e) => setField("importPermitNo", e.target.value)} />
              <TextField label="Import Contract No." size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.importContractNo || ""} onChange={(e) => setField("importContractNo", e.target.value)} />
              <TextField type="date" label="Import Validity Date" size="small"
                sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), width: 220 }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={header.importValidityDate?.split("T")[0] || ""} onChange={(e) => setField("importValidityDate", e.target.value || null)} />
              <TextField label="Income Tax No." size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.incomeTaxNo || ""} onChange={(e) => setField("incomeTaxNo", e.target.value)} />
              <TextField label="BTT Reference No." size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.bttReferenceNo || ""} onChange={(e) => setField("bttReferenceNo", e.target.value)} />
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Item Lines</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
              {lines.map((line, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField label="Item Code" size="small" sx={{ ...fieldSx, width: 160 }}
                    value={line.itemCode} onChange={(e) => handleLineChange(index, "itemCode", e.target.value)} />
                  <TextField label="Description" size="small" sx={{ ...fieldSx, flexGrow: 1 }}
                    value={line.description} onChange={(e) => handleLineChange(index, "description", e.target.value)} />
                  <TextField label="Unit" size="small" sx={{ ...fieldSx, width: 100 }}
                    value={line.unit} onChange={(e) => handleLineChange(index, "unit", e.target.value)} />
                  <TextField label="Qty" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 110 }}
                    value={line.quantity} onChange={(e) => handleLineChange(index, "quantity", Number(e.target.value))} />
                  <TextField select label="Currency" size="small" sx={{ ...fieldSx, width: 140 }} slotProps={modalSelectMenuProps}
                    value={line.currency} onChange={(e) => handleLineChange(index, "currency", e.target.value)}>
                    {currencies.map((c) => <MenuItem key={c.id} value={c.code}>{c.code}</MenuItem>)}
                  </TextField>
                  <TextField label="Unit Price" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 120 }}
                    value={line.unitPrice} onChange={(e) => handleLineChange(index, "unitPrice", Number(e.target.value))} />
                  <TextField label="BTN No." size="small" sx={{ ...fieldSx, width: 120 }}
                    value={line.btnNo || ""} onChange={(e) => handleLineChange(index, "btnNo", e.target.value)} />
                  <IconButton size="small" color="error" onClick={() => handleDeleteLine(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" onClick={handleAddLine} sx={{ alignSelf: "flex-start" }}>+ Add Item</Button>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Button
                variant="contained" color="error" disabled={!existing || isLoadingExisting}
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                <span style={themedButtonLabelStyle}>Delete</span>
              </Button>
              <Button variant="contained" sx={primaryActionButtonSx} disabled={saveMutation.isPending} onClick={handleSave}>
                <span style={themedButtonLabelStyle}>Save L/C Form</span>
              </Button>
            </Box>
          </>
        )
      )}

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        title="Delete Letter of Credit"
        message={`Delete the L/C Form for ${bankCode.trim()} / ${activeLcNo}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};

export default LetterOfCreditPage;
