# Target C# EF Core Data Models

Use these production C# entities as the absolute source of truth for the Data Layer project. Map all Middle Service Layers and React TypeScript components strictly to these structures.

---

## 1. Entity: `OrderwiseStockMaster`

```csharp
public class OrderwiseStockMaster
{
    public int Id { get; set; }
    public int BuyerCode { get; set; }
    public string Order { get; set; } = null!;
    public string ItemCode { get; set; } = null!;
    public string Unit { get; set; } = null!;
    public string Currency { get; set; } = null!;
    public decimal OrderedQuantity { get; set; }
    public decimal Price { get; set; }
    // 🚀 ADDED: Tracks cumulative reserved quantities (Maps to legacy req_qty)
    public decimal RequisitionedQuantity { get; set; }
}
```

---

## 2. Entity: `DocumentSequence`

```csharp
public class DocumentSequence
{
    public string NoteType { get; set; } = null!;
    public int LastAllocatedNumber { get; set; }
    public string? Prefix { get; set; }
}
```

---

## 3. Entity: `OrderwiseStock`

```csharp
public class OrderwiseStock
{
public int Id { get; set; }
public int BuyerCode { get; set; }
public string Order { get; set; } = null!;
public string StoreCode { get; set; } = null!;
public string ItemCode { get; set; } = null!;
public string Unit { get; set; } = null!;
public decimal OrderedQuantity { get; set; }

     // 🚀 ADDED MISSING LEDGER COLUMNS FROM YOUR DATABASE SNAPSHOT:
     public decimal QtyInHand { get; set; }      // QTY_IN_HD
     public decimal ShadowBalance { get; set; }   // SHDW_BAL
     public decimal DamagedQuantity { get; set; } // DAMG_QTY
     public decimal ToDateIssued { get; set; }    // TO_DT_ISS
     public decimal ToDateReceived { get; set; }  // TO_DT_REC
     public DateTime? LastDateIssued { get; set; } // L_DT_ISS
     public DateTime? LastDateReceived { get; set; } // L_DT_REC
     public decimal SrnBalance { get; set; }      // SRN_BAL

}
```

---

## 4. Entity: `OrderwiseStockTransaction`

```csharp
public class OrderwiseStockTransaction
{
    public int Id { get; set; } // Auto-increment Identity Seed Primary Key

    public string DocumentNumber { get; set; } = null!; // xdocno (SRN / GIN / GRN number)
    public string TransactionType { get; set; } = null!; // "0S" = SRN, "GI" = GIN, etc.
    public DateTime TransactionDate { get; set; } // xdate

    public int BuyerCode { get; set; } // xbuyer
    public string Order { get; set; } = null!; // xorder
    public string DepartmentCode { get; set; } = null!; // xdept

    // Line-Item Material Tracking Parameters
    public string StockCode { get; set; } = null!; // Splits from character positions
    public string ItemCode { get; set; } = null!;
    public string Unit { get; set; } = null!;
    public decimal Quantity { get; set; }

    public string CreatedByUsername { get; set; } = null!;
}
```

---

## 5. Entity: `Basis`

```csharp
 public class Basis
 {
     public int Id { get; set; }
     public string Code { get; set; }
     public string Description { get; set; }
     public bool ValueAdd { get; set; }
 }
```

---

## 6. Entity: `Unit`

```csharp
public class Unit
{
    public int Id { get; set; }
    public string Code { get; set; }
    public string Description { get; set; } = string.Empty;
}
```

---

## 7. Entity: `PurchaseOrder`

```csharp
 public class PurchaseOrder
 {
     public int BuyerCode { get; set; }
     public string Order { get; set; }
     public DateTime OrderDate { get; set; }
     public int GarmentType { get; set; }
     [NotMapped]
     public string GarmentTypeName { get; set; }
     [NotMapped]
     public string? Buyer { get; set; }
     public string CountryCode { get; set; }
     public string UnitCode { get; set; }
     public decimal TotalQuantity { get; set; }
     public string CurrencyCode { get; set; }
     public string Season { get; set; }
     public string BasisCode { get; set; }
     public decimal BasisValue { get; set; }
 }
```

---

## 8. Entity: `Department`

```csharp
 public class Department
 {
     public string DepartmentCode { get; set; } = null!; // xdept (e.g., "CUT", "SEW", "STR")
     public string Name { get; set; } = null!;
 }
```

## 9. Entity: `Buyer`

```csharp
 public class Buyer
 {
     public int BuyerCode { get; set; }
     public string Status { get; set; } = string.Empty;
     public string Name { get; set; } = string.Empty;
     public string? TelephoneNos { get; set; }
     public string? MobileNos { get; set; }
     public string? Fax{ get; set; }
     public string? CUSDEC { get; set; }
     public ICollection<Address> Addresses { get; set; } = new List<Address>();
 }
```

## `10. Entity: `Currency`

```csharp
 public class Currency
 {
     public int Id { get; set; }
     public string Code { get; set; } = string.Empty;
     public string Name { get; set; } = string.Empty;
     public string? CountryCode { get; set; }
     public string? Minor { get; set; }

     [NotMapped]
     public string? CurrencyDetails
     {
         get { return Code + " : " + Name; }
     }
 }
```

## 11. Entity: `StockItem`

```csharp
    public class StockItem
    {
        public StockItem()
        {
            StockCode = "";
            ItemCode = "";
            Description = "";
        }

        // FIXED: Switched from int to string to maintain leading zero structures (e.g. "01")
        public string StockCode { get; set; } = null!;

        // FIXED: Switched from int to string to safely hold codes (e.g. "01FB", "02BT")
        public string ItemCode { get; set; } = null!;

        public string Description { get; set; } = string.Empty;

        // Fluent API Navigation Property pointing back to the updated master Stock table
        [ForeignKey("StockCode")]
        public virtual Stock Stock { get; set; } = null!;
    }
```

## 12. Entity: `Stock`

```csharp
 public class Stock
 {
     // FIXED: Switched from int identity to a clean explicit string primary key
     // to preserve padded leading zero values (e.g. "01", "02") safely!
     public string StockCode { get; set; } = null!;

     public string Description { get; set; } = string.Empty;
 }
```

## 13. Entity: `Style`

```csharp
  public class Style
 {
     [NotMapped]
     public int Id { get; set; }
     public int BuyerCode { get; set; }
     [NotMapped]
     public string Buyer { get; set; }
     public string Order { get; set; }

     // Keeps track of when the order was placed (non-nullable if always known)
     public DateOnly OrderDate { get; set; }


     public int TypeCode { get; set; }
     [NotMapped]
     public string? Type { get; set; }
     public string StyleCode { get; set; }
     public string? Unit { get; set; }
     public decimal? Quantity { get; set; }
     public decimal? UnitPrice { get; set; }
     public string? ColorRatio {  get; set; } = null;
     public string? SizeRatio { get; set; } = null;
     public decimal? ExportBalance { get; set; }
     public bool? SupplierReturn { get; set; }
     public bool? CustomerReturn { get; set; }
     public string? Username { get; set; }

     // Made these nullable DateOnly because they are filled out later
     public DateOnly? ApprovedDate { get; set; }
     public DateOnly? ProductionEndDate { get; set; }
     public DateOnly? EstimateApprovalDate { get; set; }


     public string? EstimateApprovalUserName { get; set; }
     public bool? Exported { get; set; }
 }
```

## 14. Entity: `UnitConversion`

```csharp
 public class UnitConversion
 {
     public string FromUnit { get; set; }
     public string ToUnit { get; set; }
     public decimal ? Measure { get; set; }
 }
```

## 15. Entity: `Supplier`

```csharp
   public class Supplier
  {
      public int SupplierCode { get; set; }
      public Guid? AddressId { get; set; } = default;
      public string Name { get; set; } = string.Empty;
      public string? TelephoneNos { get; set; }
      public string? MobileNos { get; set; }
      public string? Fax { get; set; }

      // supplier has many addresses
      [NotMapped]
      public ICollection<Address> Addresses { get; set; } = [];
  }

  public class Address
{
    public int Id { get; set; }
    public Guid AddressId { get; set; }
    public AddressType? AddressType { get; set; }
    public string? StreetAddress { get; set; }
    public string? City { get; set; }
    public int? PostCode { get; set; }
    public string? State { get; set; }
    public string? CountryCode { get; set; }
    [NotMapped]
    public string? Country { get; set; }
    public bool? Default { get; set; }
    public string? BankCode { get; set; }
    public int? BuyerCode { get; set; }
}

public enum AddressType
{
    Residential = 1,
    Postal = 2,
    Corporate = 3,
    Billing = 4,
    Delivery = 5,
}
```

## 16. Entity: `StylewiseEvent`

```csharp
   public class StylewiseEvent
  {// Padded Character String Code Key (e.g. "E00001", "LIPDIP")
      public string EventCode { get; set; } = null!;
      public string Description { get; set; } = null!; // desc
  }


```

## 17. Entity: `EventMaster`

```csharp
  public class EventMaster
 {
     public int Id { get; set; } // Internal database auto-increment identity seed

     public int BuyerCode { get; set; }
     public string Order { get; set; } = null!;
     public int TypeCode { get; set; }
     public string StyleCode { get; set; } = null!;

     // Links straight to your master milestones dictionary string code
     public string EventCode { get; set; } = null!; // ev_code

     public DateTime? ScheduledDate { get; set; } // exp_date
     public DateTime? ActualDate { get; set; }    // rcv_date
     public string? Remarks { get; set; }         // remarks

     // Fluent navigation property linking back to your master milestones dictionary shape
     [ForeignKey("EventCode")]
     public virtual StylewiseEvent MilestoneEvent { get; set; } = null!;
 }

```

## 18. Entity: `OrderItemFeature`

```csharp
  public class OrderItemFeature
 {
     public string StockCode { get; set; } = null!;
     public string ItemCode { get; set; } = null!;
     public string? Feature1Type { get; set; } // Points to FeatureCode (e.g. 'TY', 'CL')
     public string? Feature2Type { get; set; }
     public string? Feature3Type { get; set; }
     public string? Feature4Type { get; set; }
     public decimal? CostPerUnit { get; set; }
 }

```

## 19. Entity: `ItemFeature`

```csharp
public class ItemFeature
{
    public string FeatureCode { get; set; } = null!;
    public string Description { get; set; } = null!;
}
```

## 20. Entity: `GarmentType`

```csharp
 public class GarmentType
 {
     public int Id { get; set; }
     public string TypeName { get; set; }
 }


```
