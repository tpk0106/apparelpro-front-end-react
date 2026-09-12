import { useEffect, useState } from "react";
import {
  Box, Button, CircularProgress, IconButton, MenuItem, TextField, Typography, Collapse,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { toast } from "react-toastify";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import {
  primaryActionButtonSx, themedButtonLabelStyle, numberFieldNoSpinnerSx, dateIconFieldSx, workspaceHeadingSx,
  workspaceSectionLabelSx,
} from "../../themes/workspace-theme";
import {
  useGetBuyersQuery, useGetCurrenciesQuery, useGetDestinations, useGetCountriesQuery,
  useGetBanksQuery, useGetUnits, useGetBasis,
} from "../../tanstack-hooks/custom-hooks";
import {
  useGetCustomsDeclaration, useSaveCustomsDeclaration, useDeleteCustomsDeclaration,
} from "../../tanstack-hooks/import-export/customs-declaration.hooks";
import {
  useGetClearanceOfficeLookup, useGetPaymentTermLookup, useGetTransportModeLookup, useGetDutyTaxCodeLookup,
  useGetTaxBaseCodeLookup, useGetAgreementCodeLookup, useGetCommodityCodeLookup, useGetCustomsProcedureCodeLookup,
  useGetDocumentTypeLookup,
} from "../../tanstack-hooks/import-export/customs-declaration-reference-lookups.hooks";
import ConfirmDialog from "../common/confirm-dialog";
import type {
  CustomsDeclarationHeader, CustomsDeclarationLine, CustomsDeclarationLineTax, CustomsDeclarationAttachedDocument,
} from "../../interfaces/import-export/ImportExport";

const emptyHeader = (cusNo: string): CustomsDeclarationHeader => ({
  cusNo, exporterCode: "", boiRegNo: "", consigneeCode: "", notifyPartyCode: "", declarantCode: "",
  clearanceOfficeCode: "", frontierOfficeCode: "", countryOfConsignmentCode: "", locationOfGoods: "",
  countryOfOriginCode: "", countryOfDestinationCode: "", warehouseNo: "", warehousePeriod: "",
  precedingDocNo: "", voyageNo: "", voyageDate: null, blAwbNo: "", paymentTermCode: "", deliveryTermCode: "",
  vessel: "", portOfLoadingCode: "", transportModeCode: "", prepaymentAccountName: "", prepaymentAccountNo: "",
  portOfDischargeCode: "", placeOfDeliveryCode: "", bankCode: "", referenceNo: "",
  remark1: "", remark2: "", remark3: "", remark4: "", declarantName: "", submittedByName: "",
});

const emptyLine = (): CustomsDeclarationLine => ({
  id: 0, item: "", customsProcedureCode: "", commodityCode: "", netWeight: null, grossWeight: null,
  supplementaryUnitCode: "", supplementaryQty: null, currencyCode: "", fob: null, freight: null,
  insurance: null, other: null, exchangeRate: null, countryCode: "", licenceNo: "", agreementCode: "",
  qtyDeducted: null, value: "", anyOther: "", detail: "", taxes: [],
});

const emptyTax = (): CustomsDeclarationLineTax => ({
  id: 0, taxCode: "", baseCode: "", rate: null, amount: null, exempted: null, payable: null,
});

const emptyDocument = (): CustomsDeclarationAttachedDocument => ({ id: 0, docNo: "", docTypeCode: "" });

// Matches legacy IE_CUSD1.PRG/IE_CUSD2.PRG (ie_cusd1-4.dbf) - CUSDEC I/II
// customs declaration, keyed by CUSDEC No. (CusNo). Header + item lines
// (each with its own tax sub-lines) + attached documents, all saved
// together in one PUT, same shape as the L/C Form.
const CustomsDeclarationPage = () => {
  const { fieldSx, listboxSx } = useDropdownTheme();
  const modalSelectMenuProps = { select: { MenuProps: { slotProps: { paper: { sx: listboxSx } } } } };

  const [cusNoInput, setCusNoInput] = useState("");
  const [activeCusNo, setActiveCusNo] = useState<string | null>(null);
  const [expandedLine, setExpandedLine] = useState<number | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const lookupParams = { pageIndex: 0, pageSize: 999, sortColumn: null, sortOrder: null, filterColumn: null, filterQuery: null };
  const { data: buyersPage } = useGetBuyersQuery({ ...lookupParams, sortColumn: "name", sortOrder: "asc" });
  const buyers = buyersPage?.items ?? [];
  const { data: currenciesPage } = useGetCurrenciesQuery({ ...lookupParams, sortColumn: "code", sortOrder: "asc" });
  const currencies = currenciesPage?.items ?? [];
  const { data: portsPage } = useGetDestinations(lookupParams);
  const ports = portsPage?.items ?? [];
  const { data: countriesPage } = useGetCountriesQuery({ ...lookupParams, sortColumn: "name", sortOrder: "asc" });
  const countries = countriesPage?.items ?? [];
  const { data: banksPage } = useGetBanksQuery({ ...lookupParams, sortColumn: "bankCode", sortOrder: "asc" });
  const banks = banksPage?.items ?? [];
  const { data: unitsPage } = useGetUnits(lookupParams);
  const units = unitsPage?.items ?? [];
  const { data: basisPage } = useGetBasis(lookupParams);
  const basisList = basisPage?.items ?? [];

  const { data: clearanceOffices } = useGetClearanceOfficeLookup();
  const { data: paymentTerms } = useGetPaymentTermLookup();
  const { data: transportModes } = useGetTransportModeLookup();
  const { data: dutyTaxCodes } = useGetDutyTaxCodeLookup();
  const { data: taxBaseCodes } = useGetTaxBaseCodeLookup();
  const { data: agreementCodes } = useGetAgreementCodeLookup();
  const { data: commodityCodes } = useGetCommodityCodeLookup();
  const { data: cpcCodes } = useGetCustomsProcedureCodeLookup();
  const { data: documentTypes } = useGetDocumentTypeLookup();

  const { data: existing, isFetching: isLoadingExisting } = useGetCustomsDeclaration(activeCusNo);
  const saveMutation = useSaveCustomsDeclaration();
  const deleteMutation = useDeleteCustomsDeclaration();

  const [header, setHeader] = useState<CustomsDeclarationHeader>(emptyHeader(""));
  const [lines, setLines] = useState<CustomsDeclarationLine[]>([]);
  const [documents, setDocuments] = useState<CustomsDeclarationAttachedDocument[]>([]);

  useEffect(() => {
    if (!activeCusNo) return;
    if (existing) {
      setHeader(existing.header);
      setLines(existing.lines);
      setDocuments(existing.attachedDocuments);
    } else {
      setHeader(emptyHeader(activeCusNo));
      setLines([]);
      setDocuments([]);
    }
  }, [existing, activeCusNo]);

  const handleLoad = () => {
    const trimmed = cusNoInput.trim();
    if (!trimmed) {
      toast.error("Enter a CUSDEC No. first.");
      return;
    }
    setActiveCusNo(trimmed);
  };

  const setField = <K extends keyof CustomsDeclarationHeader>(field: K, value: CustomsDeclarationHeader[K]) => {
    setHeader((p) => ({ ...p, [field]: value }));
  };

  const handleAddLine = () => setLines((p) => [...p, emptyLine()]);
  const handleLineChange = <K extends keyof CustomsDeclarationLine>(index: number, field: K, value: CustomsDeclarationLine[K]) =>
    setLines((p) => p.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  const handleDeleteLine = (index: number) => setLines((p) => p.filter((_, i) => i !== index));

  const handleAddTax = (lineIndex: number) =>
    setLines((p) => p.map((l, i) => (i === lineIndex ? { ...l, taxes: [...l.taxes, emptyTax()] } : l)));
  const handleTaxChange = <K extends keyof CustomsDeclarationLineTax>(
    lineIndex: number, taxIndex: number, field: K, value: CustomsDeclarationLineTax[K],
  ) => setLines((p) => p.map((l, i) => (i === lineIndex
    ? { ...l, taxes: l.taxes.map((t, j) => (j === taxIndex ? { ...t, [field]: value } : t)) }
    : l)));
  const handleDeleteTax = (lineIndex: number, taxIndex: number) =>
    setLines((p) => p.map((l, i) => (i === lineIndex ? { ...l, taxes: l.taxes.filter((_, j) => j !== taxIndex) } : l)));

  const handleAddDocument = () => setDocuments((p) => [...p, emptyDocument()]);
  const handleDocumentChange = <K extends keyof CustomsDeclarationAttachedDocument>(
    index: number, field: K, value: CustomsDeclarationAttachedDocument[K],
  ) => setDocuments((p) => p.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  const handleDeleteDocument = (index: number) => setDocuments((p) => p.filter((_, i) => i !== index));

  const handleSave = () => {
    if (!activeCusNo) {
      toast.error("Load or enter a CUSDEC No. first.");
      return;
    }
    saveMutation.mutate(
      { header: { ...header, cusNo: activeCusNo }, lines, attachedDocuments: documents },
      {
        onSuccess: () => toast.success("Customs Declaration saved."),
        onError: (error) => toast.error(error.message || "Failed to save Customs Declaration."),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!activeCusNo) return;
    deleteMutation.mutate(activeCusNo, {
      onSuccess: () => {
        toast.success("Customs Declaration deleted.");
        setIsDeleteConfirmOpen(false);
        setActiveCusNo(null);
        setCusNoInput("");
      },
      onError: (error) => toast.error(error.message || "Failed to delete Customs Declaration."),
    });
  };

  const dateFieldSx = { ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>) };

  return (
    <div className="flex flex-col w-[92%] mx-auto justify-around mt-10 mb-12">
      <Typography sx={workspaceHeadingSx}>CUSDEC I/II - Customs Declaration</Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 3, mb: 3 }}>
        <TextField
          label="CUSDEC No." size="small" sx={{ ...fieldSx, width: 260 }}
          value={cusNoInput} onChange={(e) => setCusNoInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleLoad(); }}
        />
        <Button variant="contained" sx={primaryActionButtonSx} onClick={handleLoad}>
          <span style={themedButtonLabelStyle}>Load / New</span>
        </Button>
      </Box>

      {activeCusNo && (
        isLoadingExisting ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 4, justifyContent: "center" }}>
            <CircularProgress size={22} />
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Loading...</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="subtitle2" sx={{ ...workspaceSectionLabelSx, mt: 1 }}>Identification / Parties</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <TextField select label="Exporter" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.exporterCode || ""} onChange={(e) => setField("exporterCode", e.target.value)}>
                {buyers.map((b) => <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>{b.buyerCode} - {b.name}</MenuItem>)}
              </TextField>
              <TextField label="BOI Reg. No." size="small" sx={{ ...fieldSx, width: 200 }}
                value={header.boiRegNo || ""} onChange={(e) => setField("boiRegNo", e.target.value)} />
              <TextField select label="Consignee" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.consigneeCode || ""} onChange={(e) => setField("consigneeCode", e.target.value)}>
                {buyers.map((b) => <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>{b.buyerCode} - {b.name}</MenuItem>)}
              </TextField>
              <TextField select label="Notify Party" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.notifyPartyCode || ""} onChange={(e) => setField("notifyPartyCode", e.target.value)}>
                {buyers.map((b) => <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>{b.buyerCode} - {b.name}</MenuItem>)}
              </TextField>
              <TextField select label="Declarant" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.declarantCode || ""} onChange={(e) => setField("declarantCode", e.target.value)}>
                {buyers.map((b) => <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>{b.buyerCode} - {b.name}</MenuItem>)}
              </TextField>
              <TextField select label="Clearance Office" size="small" sx={{ ...fieldSx, width: 240 }} slotProps={modalSelectMenuProps}
                value={header.clearanceOfficeCode || ""} onChange={(e) => setField("clearanceOfficeCode", e.target.value)}>
                {(clearanceOffices ?? []).map((c) => <MenuItem key={c.code} value={c.code}>{c.code} - {c.description}</MenuItem>)}
              </TextField>
              <TextField select label="Frontier Office" size="small" sx={{ ...fieldSx, width: 240 }} slotProps={modalSelectMenuProps}
                value={header.frontierOfficeCode || ""} onChange={(e) => setField("frontierOfficeCode", e.target.value)}>
                {(clearanceOffices ?? []).map((c) => <MenuItem key={c.code} value={c.code}>{c.code} - {c.description}</MenuItem>)}
              </TextField>
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Origin / Destination</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <TextField select label="Country of Consignment" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.countryOfConsignmentCode || ""} onChange={(e) => setField("countryOfConsignmentCode", e.target.value)}>
                {countries.map((c) => <MenuItem key={c.id} value={c.code}>{c.code} - {c.name}</MenuItem>)}
              </TextField>
              <TextField label="Location of Goods" size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.locationOfGoods || ""} onChange={(e) => setField("locationOfGoods", e.target.value)} />
              <TextField select label="Country of Origin" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.countryOfOriginCode || ""} onChange={(e) => setField("countryOfOriginCode", e.target.value)}>
                {countries.map((c) => <MenuItem key={c.id} value={c.code}>{c.code} - {c.name}</MenuItem>)}
              </TextField>
              <TextField select label="Country of Destination" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.countryOfDestinationCode || ""} onChange={(e) => setField("countryOfDestinationCode", e.target.value)}>
                {countries.map((c) => <MenuItem key={c.id} value={c.code}>{c.code} - {c.name}</MenuItem>)}
              </TextField>
              <TextField label="Warehouse No." size="small" sx={{ ...fieldSx, width: 180 }}
                value={header.warehouseNo || ""} onChange={(e) => setField("warehouseNo", e.target.value)} />
              <TextField label="Warehouse Period" size="small" sx={{ ...fieldSx, width: 180 }}
                value={header.warehousePeriod || ""} onChange={(e) => setField("warehousePeriod", e.target.value)} />
              <TextField label="Preceding Doc. No." size="small" sx={{ ...fieldSx, width: 200 }}
                value={header.precedingDocNo || ""} onChange={(e) => setField("precedingDocNo", e.target.value)} />
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Shipment</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <TextField label="Voyage No." size="small" sx={{ ...fieldSx, width: 180 }}
                value={header.voyageNo || ""} onChange={(e) => setField("voyageNo", e.target.value)} />
              <TextField type="date" label="Voyage Date" size="small" sx={{ ...dateFieldSx, width: 200 }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={header.voyageDate?.split("T")[0] || ""} onChange={(e) => setField("voyageDate", e.target.value || null)} />
              <TextField label="BL/AWB No." size="small" sx={{ ...fieldSx, width: 200 }}
                value={header.blAwbNo || ""} onChange={(e) => setField("blAwbNo", e.target.value)} />
              <TextField select label="Payment Term" size="small" sx={{ ...fieldSx, width: 240 }} slotProps={modalSelectMenuProps}
                value={header.paymentTermCode || ""} onChange={(e) => setField("paymentTermCode", e.target.value)}>
                {(paymentTerms ?? []).map((p) => <MenuItem key={p.code} value={p.code}>{p.code} - {p.description}</MenuItem>)}
              </TextField>
              <TextField select label="Delivery Term (Basis)" size="small" sx={{ ...fieldSx, width: 220 }} slotProps={modalSelectMenuProps}
                value={header.deliveryTermCode || ""} onChange={(e) => setField("deliveryTermCode", e.target.value)}>
                {basisList.map((b) => <MenuItem key={b.code} value={b.code}>{b.code} - {b.description}</MenuItem>)}
              </TextField>
              <TextField label="Vessel/Flight" size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.vessel || ""} onChange={(e) => setField("vessel", e.target.value)} />
              <TextField select label="Port of Loading" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.portOfLoadingCode || ""} onChange={(e) => setField("portOfLoadingCode", e.target.value)}>
                {ports.map((p) => <MenuItem key={p.code} value={p.code}>{p.code} - {p.destinationName}</MenuItem>)}
              </TextField>
              <TextField select label="Transport Mode (TRPT)" size="small" sx={{ ...fieldSx, width: 220 }} slotProps={modalSelectMenuProps}
                value={header.transportModeCode || ""} onChange={(e) => setField("transportModeCode", e.target.value)}>
                {(transportModes ?? []).map((t) => <MenuItem key={t.code} value={t.code}>{t.code} - {t.description}</MenuItem>)}
              </TextField>
              <TextField label="Prepayment A/C Name" size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.prepaymentAccountName || ""} onChange={(e) => setField("prepaymentAccountName", e.target.value)} />
              <TextField label="Prepayment A/C No." size="small" sx={{ ...fieldSx, width: 200 }}
                value={header.prepaymentAccountNo || ""} onChange={(e) => setField("prepaymentAccountNo", e.target.value)} />
              <TextField select label="Port of Discharge" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.portOfDischargeCode || ""} onChange={(e) => setField("portOfDischargeCode", e.target.value)}>
                {ports.map((p) => <MenuItem key={p.code} value={p.code}>{p.code} - {p.destinationName}</MenuItem>)}
              </TextField>
              <TextField select label="Place of Delivery" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.placeOfDeliveryCode || ""} onChange={(e) => setField("placeOfDeliveryCode", e.target.value)}>
                {ports.map((p) => <MenuItem key={p.code} value={p.code}>{p.code} - {p.destinationName}</MenuItem>)}
              </TextField>
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Bank / Reference</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <TextField select label="Bank" size="small" sx={{ ...fieldSx, width: 260 }} slotProps={modalSelectMenuProps}
                value={header.bankCode || ""} onChange={(e) => setField("bankCode", e.target.value)}>
                {banks.map((b) => <MenuItem key={b.bankCode} value={b.bankCode}>{b.bankCode} - {b.name}</MenuItem>)}
              </TextField>
              <TextField label="Reference No." size="small" sx={{ ...fieldSx, width: 220 }}
                value={header.referenceNo || ""} onChange={(e) => setField("referenceNo", e.target.value)} />
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Declarant / Remarks</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <TextField label="Name of Declarant (Person)" size="small" sx={{ ...fieldSx, width: 280 }}
                value={header.declarantName || ""} onChange={(e) => setField("declarantName", e.target.value)} />
              <TextField label="Submitted By (Name)" size="small" sx={{ ...fieldSx, width: 280 }}
                value={header.submittedByName || ""} onChange={(e) => setField("submittedByName", e.target.value)} />
              <TextField label="Remark 1" size="small" fullWidth sx={{ ...fieldSx, minWidth: 300 }}
                value={header.remark1 || ""} onChange={(e) => setField("remark1", e.target.value)} />
              <TextField label="Remark 2" size="small" fullWidth sx={{ ...fieldSx, minWidth: 300 }}
                value={header.remark2 || ""} onChange={(e) => setField("remark2", e.target.value)} />
              <TextField label="Remark 3" size="small" fullWidth sx={{ ...fieldSx, minWidth: 300 }}
                value={header.remark3 || ""} onChange={(e) => setField("remark3", e.target.value)} />
              <TextField label="Remark 4" size="small" fullWidth sx={{ ...fieldSx, minWidth: 300 }}
                value={header.remark4 || ""} onChange={(e) => setField("remark4", e.target.value)} />
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Item Lines</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
              {lines.map((line, index) => (
                <Box key={index} sx={{ border: "1px solid rgba(139,147,161,0.15)", borderRadius: "10px", p: 1.5 }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <TextField label="Item" size="small" sx={{ ...fieldSx, width: 100 }}
                      value={line.item} onChange={(e) => handleLineChange(index, "item", e.target.value)} />
                    <TextField select label="CPC" size="small" sx={{ ...fieldSx, width: 160 }} slotProps={modalSelectMenuProps}
                      value={line.customsProcedureCode || ""} onChange={(e) => handleLineChange(index, "customsProcedureCode", e.target.value)}>
                      {(cpcCodes ?? []).map((c) => <MenuItem key={c.code} value={c.code}>{c.code} - {c.description}</MenuItem>)}
                    </TextField>
                    <TextField select label="Commodity Code" size="small" sx={{ ...fieldSx, width: 200 }} slotProps={modalSelectMenuProps}
                      value={line.commodityCode || ""} onChange={(e) => handleLineChange(index, "commodityCode", e.target.value)}>
                      {(commodityCodes ?? []).map((c) => <MenuItem key={c.code} value={c.code}>{c.code} - {c.description}</MenuItem>)}
                    </TextField>
                    <TextField label="Net Wt." size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 110 }}
                      value={line.netWeight ?? ""} onChange={(e) => handleLineChange(index, "netWeight", e.target.value === "" ? null : Number(e.target.value))} />
                    <TextField label="Gross Wt." size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 110 }}
                      value={line.grossWeight ?? ""} onChange={(e) => handleLineChange(index, "grossWeight", e.target.value === "" ? null : Number(e.target.value))} />
                    <TextField select label="Supp. Unit" size="small" sx={{ ...fieldSx, width: 140 }} slotProps={modalSelectMenuProps}
                      value={line.supplementaryUnitCode || ""} onChange={(e) => handleLineChange(index, "supplementaryUnitCode", e.target.value)}>
                      {units.map((u) => <MenuItem key={u.id} value={u.code}>{u.code}</MenuItem>)}
                    </TextField>
                    <TextField label="Supp. Qty" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 110 }}
                      value={line.supplementaryQty ?? ""} onChange={(e) => handleLineChange(index, "supplementaryQty", e.target.value === "" ? null : Number(e.target.value))} />
                    <TextField select label="Currency" size="small" sx={{ ...fieldSx, width: 140 }} slotProps={modalSelectMenuProps}
                      value={line.currencyCode || ""} onChange={(e) => handleLineChange(index, "currencyCode", e.target.value)}>
                      {currencies.map((c) => <MenuItem key={c.id} value={c.code}>{c.code}</MenuItem>)}
                    </TextField>
                    <TextField label="FOB" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 110 }}
                      value={line.fob ?? ""} onChange={(e) => handleLineChange(index, "fob", e.target.value === "" ? null : Number(e.target.value))} />
                    <TextField label="Freight" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 110 }}
                      value={line.freight ?? ""} onChange={(e) => handleLineChange(index, "freight", e.target.value === "" ? null : Number(e.target.value))} />
                    <TextField label="Insurance" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 110 }}
                      value={line.insurance ?? ""} onChange={(e) => handleLineChange(index, "insurance", e.target.value === "" ? null : Number(e.target.value))} />
                    <TextField label="Other" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 110 }}
                      value={line.other ?? ""} onChange={(e) => handleLineChange(index, "other", e.target.value === "" ? null : Number(e.target.value))} />
                    <TextField label="Exg. Rate" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 110 }}
                      value={line.exchangeRate ?? ""} onChange={(e) => handleLineChange(index, "exchangeRate", e.target.value === "" ? null : Number(e.target.value))} />
                    <TextField select label="Ctry Code" size="small" sx={{ ...fieldSx, width: 220 }} slotProps={modalSelectMenuProps}
                      value={line.countryCode || ""} onChange={(e) => handleLineChange(index, "countryCode", e.target.value)}>
                      {countries.map((c) => <MenuItem key={c.id} value={c.code}>{c.code} - {c.name}</MenuItem>)}
                    </TextField>
                    <TextField label="Licence No." size="small" sx={{ ...fieldSx, width: 160 }}
                      value={line.licenceNo || ""} onChange={(e) => handleLineChange(index, "licenceNo", e.target.value)} />
                    <TextField select label="Agreement Code" size="small" sx={{ ...fieldSx, width: 200 }} slotProps={modalSelectMenuProps}
                      value={line.agreementCode || ""} onChange={(e) => handleLineChange(index, "agreementCode", e.target.value)}>
                      {(agreementCodes ?? []).map((a) => <MenuItem key={a.code} value={a.code}>{a.code} - {a.description}</MenuItem>)}
                    </TextField>
                    <TextField label="Qty Deducted" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 120 }}
                      value={line.qtyDeducted ?? ""} onChange={(e) => handleLineChange(index, "qtyDeducted", e.target.value === "" ? null : Number(e.target.value))} />
                    <TextField label="Value" size="small" sx={{ ...fieldSx, width: 140 }}
                      value={line.value || ""} onChange={(e) => handleLineChange(index, "value", e.target.value)} />
                    <TextField label="Any Other" size="small" sx={{ ...fieldSx, width: 140 }}
                      value={line.anyOther || ""} onChange={(e) => handleLineChange(index, "anyOther", e.target.value)} />
                    <IconButton size="small" onClick={() => setExpandedLine((p) => (p === index ? null : index))}>
                      {expandedLine === index ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteLine(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Collapse in={expandedLine === index}>
                    <Box sx={{ mt: 1.5, pl: 1 }}>
                      <TextField
                        label="24(A) Marks & Nos. (B) Pkg. Type & No. (C) Description of Goods" size="small" multiline minRows={3}
                        fullWidth sx={fieldSx}
                        value={line.detail || ""} onChange={(e) => handleLineChange(index, "detail", e.target.value)}
                      />
                      <Typography variant="caption" sx={{ ...workspaceSectionLabelSx, display: "block", mt: 1.5 }}>Taxes</Typography>
                      {line.taxes.map((tax, taxIndex) => (
                        <Box key={taxIndex} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                          <TextField select label="Tax" size="small" sx={{ ...fieldSx, width: 160 }} slotProps={modalSelectMenuProps}
                            value={tax.taxCode || ""} onChange={(e) => handleTaxChange(index, taxIndex, "taxCode", e.target.value)}>
                            {(dutyTaxCodes ?? []).map((t) => <MenuItem key={t.code} value={t.code}>{t.code} - {t.description}</MenuItem>)}
                          </TextField>
                          <TextField select label="Base" size="small" sx={{ ...fieldSx, width: 160 }} slotProps={modalSelectMenuProps}
                            value={tax.baseCode || ""} onChange={(e) => handleTaxChange(index, taxIndex, "baseCode", e.target.value)}>
                            {(taxBaseCodes ?? []).map((t) => <MenuItem key={t.code} value={t.code}>{t.code} - {t.description}</MenuItem>)}
                          </TextField>
                          <TextField label="Rate" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 100 }}
                            value={tax.rate ?? ""} onChange={(e) => handleTaxChange(index, taxIndex, "rate", e.target.value === "" ? null : Number(e.target.value))} />
                          <TextField label="Amount" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 120 }}
                            value={tax.amount ?? ""} onChange={(e) => handleTaxChange(index, taxIndex, "amount", e.target.value === "" ? null : Number(e.target.value))} />
                          <TextField label="Exempted" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 120 }}
                            value={tax.exempted ?? ""} onChange={(e) => handleTaxChange(index, taxIndex, "exempted", e.target.value === "" ? null : Number(e.target.value))} />
                          <TextField label="Payable" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 120 }}
                            value={tax.payable ?? ""} onChange={(e) => handleTaxChange(index, taxIndex, "payable", e.target.value === "" ? null : Number(e.target.value))} />
                          <IconButton size="small" color="error" onClick={() => handleDeleteTax(index, taxIndex)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                      <Button size="small" onClick={() => handleAddTax(index)}>+ Add Tax</Button>
                    </Box>
                  </Collapse>
                </Box>
              ))}
              <Button size="small" onClick={handleAddLine} sx={{ alignSelf: "flex-start" }}>+ Add Item Line</Button>
            </Box>

            <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>Attached Documents</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
              {documents.map((doc, index) => {
                const docNoOptions = Array.from(new Map((documentTypes ?? []).map((d) => [d.docNo, d])).values());
                const docTypeOptions = (documentTypes ?? []).filter((d) => d.docNo === doc.docNo);
                return (
                  <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField select label="Document" size="small" sx={{ ...fieldSx, width: 280 }} slotProps={modalSelectMenuProps}
                      value={doc.docNo} onChange={(e) => { handleDocumentChange(index, "docNo", e.target.value); handleDocumentChange(index, "docTypeCode", ""); }}>
                      {docNoOptions.map((d) => <MenuItem key={d.docNo} value={d.docNo}>{d.docNo} - {d.description}</MenuItem>)}
                    </TextField>
                    <TextField select label="Document Type" size="small" sx={{ ...fieldSx, width: 280 }} slotProps={modalSelectMenuProps}
                      value={doc.docTypeCode} onChange={(e) => handleDocumentChange(index, "docTypeCode", e.target.value)}>
                      {docTypeOptions.map((d) => <MenuItem key={d.id} value={d.docTypeCode}>{d.docTypeCode}</MenuItem>)}
                    </TextField>
                    <IconButton size="small" color="error" onClick={() => handleDeleteDocument(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
              <Button size="small" onClick={handleAddDocument} sx={{ alignSelf: "flex-start" }}>+ Add Document</Button>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Button
                variant="contained" color="error" disabled={!existing || isLoadingExisting}
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                <span style={themedButtonLabelStyle}>Delete</span>
              </Button>
              <Button variant="contained" sx={primaryActionButtonSx} disabled={saveMutation.isPending} onClick={handleSave}>
                <span style={themedButtonLabelStyle}>Save CUSDEC</span>
              </Button>
            </Box>
          </>
        )
      )}

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        title="Delete Customs Declaration"
        message={`Delete CUSDEC No. ${activeCusNo}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};

export default CustomsDeclarationPage;
