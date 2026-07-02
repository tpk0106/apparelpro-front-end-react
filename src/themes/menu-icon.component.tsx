// import React, { Component } from "react";

// import { AddCircleOutline, ExpandMoreOutlined } from "@mui/icons-material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { ReorderOutlined } from "@mui/icons-material";
import { ProductionQuantityLimitsOutlined } from "@mui/icons-material";
// import { ReportOutlined } from "@mui/icons-material";
import { RoomPreferencesOutlined } from "@mui/icons-material";
import { RequestQuoteOutlined } from "@mui/icons-material";
import { ReportProblemOutlined } from "@mui/icons-material";

type Icn = {
  name: string;
};
const MenuIcon = ({ name }: Icn) => {
  switch (name) {
    case "General":
      return <RoomPreferencesOutlined className="text-blue-400" />;
    case "Order Management Reference":
    case "Order Confirmation Routine":
    case "Style Details":
      return <ReorderOutlined className="text-blue-400" />;
    case "Order Management":
      return <ReorderOutlined className="text-blue-400" />;
    case "General Inventory":
    case "Material Consumptions":
    case "Basis":
    case "Buyer":
      return <Inventory2OutlinedIcon className="text-blue-400" />;
    case "Order Wise Inventory":
    case "Purchase Order Entry":
      return <Inventory2OutlinedIcon className="text-blue-400" />;
    case "Production Control":
    case "Currency":
    case "Bank":
    case "Unit":
    case "Garment Type":
    case "Country":
      return <ProductionQuantityLimitsOutlined className="text-blue-400" />;
    case "Quota register":
    case "Stores Requisition Note":
      return <RequestQuoteOutlined className="text-blue-400" />;
    case "Reports":
      return <ReportProblemOutlined className="text-blue-400" />;
  }
};

export default MenuIcon;
