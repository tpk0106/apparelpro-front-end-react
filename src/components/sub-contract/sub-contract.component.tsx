import { useCallback, useMemo, useState } from "react";
import { Alert, Box, ThemeProvider, Typography } from "@mui/material";
import ConsumptionScopeHeader from "../material-consumption/consumption-scope-header.component";
import type { SelectedScopeContext } from "../material-consumption/material-consumption.types";
import { asideMenuTitleTypographyTheme } from "../../themes/themes";
import {
  useGetSubContractors,
  useGetCurrenciesQuery,
  useGetUnits,
} from "../../tanstack-hooks/custom-hooks";
import { useGetSubContracts } from "../../tanstack-hooks/sub-contract.hooks";
import SubContractGrid from "./sub-contract-grid.component";
import type { SubContractor } from "../../interfaces/references/SubContractor";
import type { Currency } from "../../interfaces/references/Currency";
import type { Unit } from "../../interfaces/references/Unit";

// Order Management -> D. Sub Contracts (legacy OD_SUBC1.PRG / od_subc1.dbf,
// traced from OD_MENU.PRG - see SubContract.cs's class comment for the full
// Zero-Assumption gap history). Global theme (useApparelProTable /
// ConsumptionScopeHeader), same as Additional Costs per Garment's scope
// selector - NOT the dark mockup card theme those screens use below the
// header, since Sub Contract's data model (one flat per-Style list) doesn't
// need that layered picker/form UI.
const LOOKUP_PAGE = {
  pageIndex: 0,
  pageSize: 999,
  sortColumn: null,
  sortOrder: null,
  filterColumn: null,
  filterQuery: null,
};

export default function SubContractPage() {
  const [scopeContext, setScopeContext] = useState<SelectedScopeContext | null>(
    null,
  );
  const [quantityWarning, setQuantityWarning] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleScopeContextChange = useCallback(
    (context: SelectedScopeContext | null) => {
      setScopeContext(context);
      setQuantityWarning(null);
      setSaveError(null);
    },
    [],
  );

  const scope = useMemo(
    () => ({
      buyerCode: scopeContext?.buyerCode ?? 0,
      order: scopeContext?.order ?? "",
      typeCode: scopeContext?.typeCode ?? 0,
      styleCode: scopeContext?.styleCode ?? "",
    }),
    [scopeContext],
  );

  const {
    data: subContracts = [],
    isLoading: isSubContractsLoading,
  } = useGetSubContracts(scope, !!scopeContext);

  const { data: subContractorPageData } = useGetSubContractors(LOOKUP_PAGE);
  const subContractorsList = useMemo<SubContractor[]>(
    () => subContractorPageData?.items || [],
    [subContractorPageData],
  );

  const { data: currencyPageData } = useGetCurrenciesQuery(LOOKUP_PAGE);
  const currenciesList = useMemo<Currency[]>(
    () => currencyPageData?.items || [],
    [currencyPageData],
  );

  const { data: unitPageData } = useGetUnits(LOOKUP_PAGE);
  const unitsList = useMemo<Unit[]>(
    () => unitPageData?.items || [],
    [unitPageData],
  );

  return (
    <div className="flex flex-col w-[90%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">SUB CONTRACTS</Typography>
        </ThemeProvider>
      </div>

      <ConsumptionScopeHeader onScopeChange={handleScopeContextChange} />

      {scopeContext ? (
        <Box sx={{ mt: 2 }}>
          {quantityWarning && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              onClose={() => setQuantityWarning(null)}
            >
              {quantityWarning}
            </Alert>
          )}
          {saveError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setSaveError(null)}
            >
              {saveError}
            </Alert>
          )}

          <SubContractGrid
            scope={scope}
            rows={subContracts}
            isLoading={isSubContractsLoading}
            subContractorsList={subContractorsList}
            currenciesList={currenciesList}
            unitsList={unitsList}
            onQuantityWarning={setQuantityWarning}
            onSaveError={setSaveError}
          />
        </Box>
      ) : (
        <Alert severity="info" variant="outlined" sx={{ m: 2 }}>
          Please select a Buyer, Purchase Order, Garment Type, and Style in
          the header above to load the Sub Contract entries.
        </Alert>
      )}
    </div>
  );
}
