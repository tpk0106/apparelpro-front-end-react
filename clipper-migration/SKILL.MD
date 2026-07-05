---
name: clipper-migration
description: Legacy migration playbook for converting Clipper/xBase applications to React, TypeScript, TanStack, and a 3-Tier .NET 10 Web API. Trigger when analyzing .prg, .ch, or .dbf files.
user-invocable: true
disable-model-invocation: false
---

## Tech Stack & Version Constraints
Every line of code generated MUST comply with these exact package versions. Do not use older or deprecated syntax:

## System Overview & Business Domain
- **Core Domain**: This system is an Enterprise Resource Planning (ERP) platform for garment and apparel manufacturing management (ApparelPro).
- **Core Workflow**: It coordinates purchase orders, style master configurations, fabric/trim material consumption matrices, supplier procurement, multi-currency pricing, and warehouse logistics.
- **Relational Complexity**: Legacy systems rely heavily on absolute, shared flat file lookups. The modernized application must transition this into a highly structured, relational transaction workflow.

## Strict Code Quality Restrictions (Non-Negotiable)

### TypeScript & Frontend Constraints
- **Zero `any` Types Allowed**: You must never use `any` or `unknown` as escape hatches. Every object shape, component prop, API payload, and event callback must be explicitly and strictly typed.
- **Stricter Type Implementations**: Use custom descriptive interfaces or TypeScript types for all data maps, structural configurations, and parameters.
- **Controlled MUI Forms**: Form fields must be explicitly bound via React state and completely governed by strong `zod` schemas.

### C# & Backend Constraints
- **Asynchronous Execution Only**: All repository access, EF Core operations, and controller endpoints must use `async/await` syntax and append `Async` to method naming structures.
- **Null Safety**: Enable and strictly enforce C# nullable reference types (`#nullable enable`). Avoid using null forgiveness operators (`!`) unless explicitly dealing with EF Core boundary conditions.
- **Clean Segregation**: Under no circumstances should database context tracking leakage escape into the REST Controller. Controllers must exclusively digest and return API Models.

## Strict Naming Conventions & Code Style Guidelines

## Architectural Patterns, SOLID Principles & Design Patterns

### 1. C# Backend Engineering (SOLID & Clean Architecture)
Every generated C# component must follow strict SOLID principles and enterprise design patterns:
- **Single Responsibility Principle (SRP)**: Controllers handle routing/HTTP protocol states; Services handle pure business validations; Entities handle relational mappings.
- **Dependency Inversion Principle (DIP)**: Controllers must exclusively interact with abstractions (`IBankService`), never concrete implementations.
- **Unit of Work / Repository Patterns**: Wrap complex data mutations inside isolated database transaction blocks (`BeginTransactionAsync`) to keep data atomic.
- **Factory / Strategy Patterns**: If the Clipper code switches behavior dynamically based on a parameter (e.g., changing behavior depending on `Type`), use a polymorphic strategy mapping pattern instead of messy nested `if/else` statements.

### 2. React 19 Frontend Patterns & Best Practices
Every React component must implement modern architectural design frameworks to ensure peak readability, maintainability, and responsiveness:
- **Separation of Concerns (SoC)**: Separate your UI presentation layer from your operational logic layer. Keep UI components light and clean by extracting your TanStack Queries, state manipulations, and Zod form mutations out into isolated custom React hooks (e.g., `useBankTable.ts`).
- **Compound Components Pattern**: For complex modal layouts or step-by-step form pipelines, use the compound component pattern to manage shared child component states implicitly.
- **Controlled vs Uncontrolled Forms**: Use controlled components powered by React state, backed by strong `zod` runtime schemas to catch form errors instantly.

### 3. High-Density Frontend Performance Optimizations
To handle large manufacturing item sheets without causing screen lag, enforce these extreme optimization frameworks:
- **Optimistic UI Updates**: On critical transactional operations (like modifying material requirements), configure the TanStack Query `onMutate` cache pipeline to update the UI immediately before the server responds, reverting smoothly if a connection fault occurs.
- **Component Render Safeguarding**: Prevent unnecessary DOM updates in deep lists by utilizing `React.memo` for static rows, and wrap complex mapping arrays or expensive filtration variables inside `useMemo` hooks.
- **Referential Stability Controls**: Always pass child callback events inside a `useCallback` wrapper to stop memory leakage and redundant rendering cascades across child inputs.
- **Virtualised Grid Displays**: For data lists containing large rows (e.g., displaying all items inside an order), configure `material-react-table` to use virtualised layout rendering, which loads only visible elements into the DOM tree.

### 4. TypeScript & React Workspace Rules
- **Interfaces & Types**: Always use **PascalCase**. Prefixes like `I` for interfaces are strictly forbidden (e.g., use `StyleDetails` instead of `IStyleDetails`). Use descriptive suffixes for operational contexts (e.g., `StyleQueryRequest`, `MaterialConsumptionResponse`).
- **Variables & Functions**: Always use **camelCase** (e.g., `isValidated`, `fetchStyleDetails`). Avoid legacy prefixing or truncations (e.g., convert `xbuyer` $\rightarrow$ `buyerCode`, `flg` $\rightarrow$ `isProcessing`).
- **React Components**: Always use **PascalCase** matching the file name (e.g., `MaterialConsumptionGrid.tsx`).
- **Boolean Flags**: Must be prefixed with clear interrogative markers such as `is`, `has`, `should`, or `can` (e.g., `isCloneDialogOpen`, `hasValidationErrors`).

### 5. C# & .NET 10 Layer Rules
- **Classes, Entities & Methods**: Always use **PascalCase** (e.g., `OdStyleEntity`, `GetValidatedStyleDetailsAsync`).
- **Model Postfixes**: Explicitly tag structural classes based on their project tier boundaries to safeguard architecture segregation:
  - Controller Layer: `[Name]APIModel` (e.g., `CreateBankAPIModel`)
  - Business Layer: `[Name]ServiceModel` (e.g., `CreateBankServiceModel`)
  - Data Layer: Entity classes use matching legacy file wrappers or database tables directly by name without additional prefixes (e.g., `Style` instead of `OdStyle`).
- **Method Arguments & Local Variables**: Always use **camelCase** (e.g., `pageSize`, `styleRecord`).
- **Private Readonly Dependencies**: Always use camelCase prefixed with an underscore (e.g., `_bankService`, `_mapper`).

### 6. Database Context & Core Service Dependencies
- **Primary Database Context**: The application uses a single, centralized database tracking context named `ApparelProDbContext`.
- **Service Dependency Injections**: Every middle-layer business service class constructor must explicitly inject and maintain private readonly fields for these two essential dependencies:
  - `private readonly IMapper _mapper;`
  - `private readonly ApparelProDbContext _apparelProDbContext;`  
- **Constructor Layout Matching**: All service constructors must initialize these dependencies exactly using the naming conventions demonstrated in your architecture style:
  `public BankService(IMapper mapper, ApparelProDbContext apparelProDbContext) { _mapper = mapper; _apparelProDbContext = apparelProDbContext; }`


### Frontend Workspace Dependencies
- **Core UI**: React `^19.2.6` & React-DOM `^19.2.6` (TypeScript `~6.0.2`, Vite `^8.0.12`).
- **Styling**: Tailwind CSS `@tailwindcss/vite` `^4.3.0` with `@emotion/react` `^11.14.0` and `@emotion/styled` `^11.14.1`.
- **Component Library**: Material-UI (MUI) `@mui/material` `^9.0.1`, `@mui/icons-material` `^9.0.1`, and `@mui/x-date-pickers` `^9.3.0`.
- **Global State**: `@reduxjs/toolkit` `^2.12.0`, `react-redux` `^9.3.0`, and `redux-saga` `^1.5.0` for async side effects. Persistent via `redux-persist` `^6.0.0`.
- **Server State & Data Fetching**: `@tanstack/react-query` `^5.100.14` and `axios` `^1.16.1`.
- **Data Tables**: `material-react-table` `^3.2.1` (with built-in server-side pagination, sorting, and filtering support).
- **Forms & Validation**: `zod` `^4.4.3` for schema definition and runtime validation.
- **Routing & Feedback**: `react-router-dom` `^7.16.0` and `react-toastify` `^11.1.0`.

### Backend Target Architecture (.NET 10)
- **Framework**: C# .NET 10 Web API with Entity Framework Core targeting Microsoft SQL Server 2022.
- **Mapping**: AutoMapper for layer-to-layer DTO conversions.
- **Security**: Endpoint authorization matching roles like `[Authorize(Roles = "Merchandiser, Merchandiser Manager")]`.

### Security & Authentication Protocol
- **Token Authentication**: The backend API operates strictly on a type-safe token authentication schema (JWT/Bearer Token validation).
- **Identity Enforcement**: Every Controller class must be guarded with explicit identity metadata attributes using `[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]`.
- **Legacy Context Resolution**: When translating legacy session state variables (such as `user_no` or transaction logging flags), do NOT create input fields or pass them as parameters. Instead, securely extract the caller's contextual parameters directly from the token identity profile via `HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)`.

---

## Strict 3-Layer Mapping Architecture
When migrating processing logic, always structure the C# codebase using this data conversion workflow:

## Strict Database Mapping Execution Constraints

### 1. Mandatory Table Pluralisation Rule
When generating EF Core `DbContext` datasets or referencing SQL Server target instances, you must always translate the Singular C# Entity Model class name into its plural equivalent for the table mapping:
- If a model is named `Unit`, it must map to the database table `Units`.
- If a model is named `DocumentSequence`, it must map to the database table `DocumentSequences`.
- Enforce this behavior explicitly in Entity Framework Core configurations using Fluent API table declarations:
  `builder.ToTable("Units");`

### 2. Zero-Assumption Boundary Rule (Strict Halting)
- If a Clipper file references a legacy dataset (`.dbf` or index file) that does not exist in your registries (`SKILL.md` or `DATAMODELS.md`), you are strictly FORBIDDEN from guessing or fabricating a data structure or database name.
- In this scenario, you must immediately halt the migration process, output a descriptive warning flag to the user detailing the missing schema dependencies, and request the exact C# Entity layout from the developer before resuming.

### AutoMapper Profile & Class Segregation Rules
You must organize all mapping configurations into these two explicit AutoMapper Profile classes, enforcing standard `.MaxDepth(2)` conventions on every map:

1. **Service to Data Layer Mappings**
   - **Profile Class Name**: `public class DatabaseToServiceMappings : Profile`
   - **Mapping Directions**: Register mappings between business Service Models and EF Core Data Layer entities (including Create and Update models), ensuring bidirectional capabilities where appropriate:
     `CreateMap<XServiceModel, XDataModel>().MaxDepth(2).ReverseMap();`
     `CreateMap<CreateXServiceModel, XDataModel>().MaxDepth(2);`
     `CreateMap<UpdateXServiceModel, XDataModel>().MaxDepth(2);`

2. **Controller to Service Layer Mappings**
   - **Profile Class Name**: `public class ServicetoAPIModelMappings : Profile`
   - **Mapping Directions**: Register mappings between entry-point API Models and core Service Models:
     `CreateMap<CreateXAPIModel, CreateXServiceModel>().MaxDepth(2);`
     `CreateMap<UpdateXAPIModel, UpdateXServiceModel>().MaxDepth(2);`
     `CreateMap<XServiceModel, XAPIModel>().MaxDepth(2).ReverseMap();`

<!-- - **AutoMapper Enforcements**: Generate AutoMapper `CreateMap<X, Y>().MaxDepth(2)` expressions for each layer transition. -->
- **Relational Glue**: In service layers, explicitly loop through child collections to bind parent foreign keys (e.g., `child.ParentCode = parent.ParentCode`) before updating the DbContext.

### 3. Server-Side Pagination & Listing Contracts
Whenever a Clipper workflow requires data display lists (such as legacy arrays or `DBEDIT()` loops), you must implement full server-side pagination across all layers using this exact specification:

- **Unified Pagination Wrapper Model**: You must utilize this exact class implementation for all paginated client data deliveries:
  ```csharp
  public class PaginationAPIModel<T> where T : class
  {
      public PaginationAPIModel() { Items = new List<T>(); }
      public PaginationAPIModel(int pageSize, int currentPage, IList<T> items, 
          int totalPages, string? sortColumn, string? sortOrder, string? filterColumn, string? filterQuery)
      {
          PageSize = pageSize;
          CurrentPage = currentPage;
          Items = items;
          TotalPages = totalPages;
          SortColumn = sortColumn;
          SortOrder = sortOrder;
          FilterColumn = filterColumn;
          FilterQuery = filterQuery;
      }
      public IList<T> Items { get; set; }     
      public int PageSize { get; set; } 
      public int CurrentPage { get; set; }      
      public int TotalItems { get; set; }
      public string? SortColumn { get; set; }
      public string? SortOrder { get; set; }
      public string? FilterColumn { get; set; }
      public string? FilterQuery { get; set; }
      public int TotalPages { get; set; }          
  }
  ```

- **Contextual Endpoint Naming Rule**: Method names inside your controllers must dynamically change to match the specific domain entity name being handled instead of using generic terms. 
  - If the entity is `Bank` inside `BankController`, the listing method name must be `GetBanksAsync`.
  - If the entity is `Country` inside `CountryController`, the listing method name must be `GetCountriesAsync`.

- **Controller Signature Layout**: All listing endpoints must consume query parameters and wrap responses exactly like this controller structure:
  ```csharp
  [HttpGet("list")]
  [Authorize(Roles = "Inventory, Merchandiser, Merchandiser Manager, Order Entry Operator")]
  [ProducesResponseType(typeof(PaginationAPIModel<XAPIModel>), HttpStatusCodes.OK)]
  public async Task<IActionResult> Get[Entities]Async(
    [FromQuery] int pageSize,
    [FromQuery] int pageNumber,
    [FromQuery] string? sortColumn = null,
    [FromQuery] string? sortOrder = null,
    [FromQuery] string? filterColumn = null,
    [FromQuery] string? filterQuery = null)
  {
      var serviceModels = await _xService.Get[Entities]Async(pageNumber, pageSize, sortColumn, sortOrder, filterColumn, filterQuery);
      var itemsPage = _mapper.Map<PaginationAPIModel<XAPIModel>>(serviceModels);
      return Ok(itemsPage);
  }
  ```
----
  
### 4. Request Flow (Ingress)
`API Model (Controller Layer)` $\rightarrow$ `Service Model (Business Layer)` $\rightarrow$ `Data Model (EF Core Entity Layer)`

### 5. Response Flow (Egress)
`Data Model (EF Core)` $\rightarrow$ `Service Model` $\rightarrow$ `API Model` $\rightarrow$ `JSON Client Response`
---

## Translation Rules

*Note to Claude: As the project progresses, the user will feed you more explicit mappings. Keep any unmapped files aligned with the legacy prefix patterns (e.g., `OdSacc1`) until a modern name is registered here.*

## Legacy DBF to Modern Data Model Registry
When migrating code that references the following legacy tables, match them strictly to these existing C# entity data models found in `DATAMODELS.md`:

- **in_stmst** $\rightarrow$ Maps strictly to the `OrderwiseStockMaster` entity.
- **in_stock** $\rightarrow$ Maps to the `OrderwiseStock` entity.
- **od_sacc3** $\rightarrow$ Maps to the `StyleMaterialConsumptionLedger` entity.
- **od_po** $\rightarrow$ Maps to the `PurchaseOrder` entity.
- **od_bref** $\rightarrow$ Maps to the `Basis` entity.
- **od_uref** $\rightarrow$ Maps to the `Unit` entity.
- **od_dept** $\rightarrow$ Maps to the `Department` entity.
- **od_itm** $\rightarrow$ Maps to the `StockItem` entity.
- **od_byref** $\rightarrow$ Maps to the `Buyer` entity.
- **od_stk** $\rightarrow$ Maps to the `Stock` entity.
- **od_style** $\rightarrow$ Maps to the `Style` entity.
- **od_unit** $\rightarrow$ Maps to the `Unit` entity.
- **od_conv** $\rightarrow$ Maps to the `UnitConversion` entity.
- **od_supp** $\rightarrow$ Maps to the `Supplier` entity.
- **od_event** $\rightarrow$ Maps to the `StylewiseEvents` entity.
- **od_emast** $\rightarrow$ Maps to the `EventMaster` entity.
- **od_itmf** $\rightarrow$ Maps to the `OrderItemFeature` entity.
- **od_feat** $\rightarrow$ Maps to the `ItemFeature` entity.
- **od_typre** $\rightarrow$ Maps to the `GarmentType` entity.

### Document Sequence Constraints
- Whenever legacy tracking code generates receipt reference keys, use the `DocumentSequence` entity from `DATAMODELS.md`.
- This DocumentSequence entity is the single source of truth for all sequential numbering and prefixing logic. Do not hardcode any sequence numbers or prefixes in the service layer; always query and update this table atomically.
- DocumentSequence is a singleton table with one row per `NoteType`. Always ensure that the `LastAllocatedNumber` is incremented and persisted in a transaction-safe manner to avoid duplicate sequence generation.

### 1. Database & State Mapping
- Clipper DBF/NTX Tables $\rightarrow$ SQL Server Tables mapped via EF Core Fluent API.
- Clipper Local/Public Variables $\rightarrow$ Component State, Redux Slices, or C# DTOs.
- Clipper Database Commands (`REPLACE`, `APPEND BLANK`, `SEEK`) $\rightarrow$ Async EF Core LINQ methods (`Add`, `SaveChangesAsync`, `FirstOrDefaultAsync`).

### 2. UI Mapping
- Clipper `@ SAY / GET / READ` text fields $\rightarrow$ Controlled MUI v9 `TextField` components inside standard forms validated with a `zod` schema.
- Clipper `DBEDIT()` and arrays $\rightarrow$ Responsive `material-react-table` grids linked to backend server-side pagination endpoints.
- Clipper `do error` or `do mesg` prompts $\rightarrow$ Actionable, real-time alerts via `toast.error()` or `toast.success()`.

---

## Output Specification
For every Clipper code block or file provided, output exactly four distinct markdown sections:

1. **Legacy Analysis**: A summary pinpointing accessed Clipper tables, system behavior, transactional validation loops, and unexpected functional mutations.
2. **C# Data Layer (EF Core Entities)**: Strongly-typed database entities with Fluent API layouts matching the Clipper tables.
3. **C# Service & Controller Layers**: Production-ready code showing the distinct `API Models`, `Service Models`, AutoMapper registration snippets, service logic loops, and authorized REST Controller endpoints with complete pagination parameters.
4. **TypeScript Frontend Layer**: Complete React component files matching your exact `package.json` specifications (MUI v9 inputs, `material-react-table` grids utilizing your custom pagination parameters, Zod forms, TanStack queries, and Toastify notifications).

## Strict Phased Execution & Architectural Justification Rules

### 1. Phased Migration Pipeline (Strictly One Step at a Time)
You are strictly forbidden from outputting the entire backend and frontend code in a single turn. You must execute the migration in isolated phases, halting for developer validation between steps:

- **Phase 1: Backend Layer Migration (Active)**: Analyze the Clipper script and generate only the C# Data Layer, Service Layer, Controller endpoints, and AutoMapper configurations. Provide architectural reasoning for every pattern selected. Stop execution here and output this exact prompt to the user:
  `"🛑 [Backend Phase Completed] - Please review the C# implementation above. Reply with 'PROCEED' to initiate Phase 2 (React Frontend Layer Migration)."_`
- **Phase 2: Frontend Layer Migration (Gated)**: Trigger this phase ONLY when the developer explicitly types "PROCEED". Generate the corresponding TypeScript interfaces, Zod validation schemas, TanStack queries/mutations, and MUI v9 component view layout code.

### 2. Mandatory Architectural Justifications
For every architectural pattern, framework method, or language feature you introduce (in both C# and TypeScript), you must append a brief, explicit rationale explaining:
- **Why** this specific approach represents modern industry best practice (referencing SOLID or React best practices).
- **How** it solves the structural layout problem or legacy flaw natively.
- **Why** this specific approach represents modern industry best practice.
- **Why** it is highly appropriate given the legacy Clipper workflow being replaced.
- *Example justification pattern:* "Utilized `BeginTransactionAsync()` because the legacy script performs multiple cascading table edits across an explicit loop; a native SQL transaction ensures atomic rollback if any child entity validation fails."

### 3. Pre-Migration Code Defect & Performance Audit
Before outputting any modern C# code during Phase 1, you must perform a comprehensive engineering audit of the raw Clipper snippet. Explicitly identify and warn the developer about:
- **Concurrency & Locking Defects**: Highlight where the legacy code updates files without proper file/record locks (`FLOCK()` / `RLOCK()`), which will cause write-collisions.
- **Performance Inefficiencies**: Point out sequential scans (`LOCATE` or unindexed `DO WHILE` loops) that will cause massive database bottlenecks if left optimized.
- **Resource & Integrity Risks**: Flag points where early returns (`retu` or `clos data`) might leave active data streams uncommitted or corrupt data relational states.
- **Modern Resolution Strategy**: Explain exactly how our new 3-tier .NET 10 database engine natively solves these legacy flaws (e.g., isolation levels, database transaction scopes, and indexing parameters).
