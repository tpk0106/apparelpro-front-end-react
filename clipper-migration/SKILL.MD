---
name: clipper-migration
description: Legacy migration playbook for converting Clipper/xBase applications to React, TypeScript, TanStack, and a 3-Tier .NET 10 Web API. Trigger when analyzing .prg, .ch, or .dbf files.
user-invocable: true
disable-model-invocation: false
---

## Tech Stack & Version Constraints
Every line of code generated MUST comply with these exact package versions. Do not use older or deprecated syntax:

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
- **Framework**: C# .NET 10 Web API with Entity Framework Core targeting Microsoft SQL Server.
- **Mapping**: AutoMapper for layer-to-layer DTO conversions.
- **Security**: Endpoint authorization matching roles like `[Authorize(Roles = "Merchandiser, Merchandiser Manager")]`.

---

## Strict 3-Layer Mapping Architecture
When migrating processing logic, always structure the C# codebase using this data conversion workflow:

### 1. Request Flow (Ingress)
`API Model (Controller Layer)` $\rightarrow$ `Service Model (Business Layer)` $\rightarrow$ `Data Model (EF Core Entity Layer)`
- **AutoMapper Enforcements**: Generate AutoMapper `CreateMap<X, Y>().MaxDepth(2)` expressions for each layer transition.
- **Relational Glue**: In service layers, explicitly loop through child collections to bind parent foreign keys (e.g., `child.ParentCode = parent.ParentCode`) before updating the DbContext.

### 2. Response Flow (Egress)
`Data Model (EF Core)` $\rightarrow$ `Service Model` $\rightarrow$ `API Model` $\rightarrow$ `JSON Client Response`
- **Pagination Contracts**: All listing endpoints must accept `pageSize`, `pageNumber`, `sortColumn`, `sortOrder`, `filterColumn`, and `filterQuery`, returning data encapsulated inside a unified `PaginationAPIModel<T>`.

---

## Translation Rules

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
