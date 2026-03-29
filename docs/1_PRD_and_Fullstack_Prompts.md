# MoneyMate — Product Requirements Document (PRD) + Fullstack Development Prompts

## Document Purpose

This document is a **super-detailed product requirements document** and a **fullstack website development prompt pack** for **MoneyMate**, a personal finance web application that can:

- analyze and display **expenses**
- analyze and display **income**
- track **regular bank balances**
- track **investment bank balances**
- ingest and analyze **stock activity**
- support both **automatically inputted** and **manually inputted** uploaded documents
- normalize financial data from uploaded documents into a unified financial ledger and portfolio view

This document is written so it can be used directly as:
1. a product specification for a software team,
2. a build brief for an AI coding agent,
3. a technical implementation blueprint,
4. a parsing and data normalization specification,
5. a UI/UX planning reference.

---

# 1. Product Overview

## 1.1 Product Name
**MoneyMate**

## 1.2 Product Vision
MoneyMate is a personal finance management website that consolidates a user’s financial life into one place by combining:

- cashflow tracking,
- account balance tracking,
- portfolio tracking,
- document-based financial ingestion,
- manual correction and reconciliation,
- timeline-based reporting,
- actionable insights.

MoneyMate should reduce the burden of manually tracking money across different financial sources by allowing users to upload statements and documents, automatically parse them into structured records, review/edit them, and view analytics in a clean dashboard.

## 1.3 Core Value Proposition
Most finance tools either:
- require manual data entry,
- rely only on bank integrations,
- focus only on budgeting,
- or focus only on investments.

MoneyMate combines:
- **document ingestion**
- **manual entry**
- **financial data normalization**
- **multi-account analytics**
- **investment activity parsing**
- **correction workflows**
- **auditable source-to-record traceability**

into a single web app.

## 1.4 Product Positioning
MoneyMate is a hybrid between:
- a personal finance dashboard,
- a document-based accounting assistant,
- and a retail investor activity tracker.

It is designed for users who may not have reliable API banking connections and instead want to build a trustworthy finance system from uploaded documents.

---

# 2. Problem Statement

Users have financial data spread across:
- bank statements,
- e-wallet exports,
- salary slips,
- expense receipts,
- stock activity statements,
- manual notes.

Problems users face:
1. No unified place to see total financial position.
2. Uploaded documents are hard to interpret consistently.
3. Investment statements are not easy to merge with cash balances.
4. Manual finance tracking is tedious and error-prone.
5. Users need the ability to fix parsing mistakes.
6. Different documents have different formats and naming conventions.
7. Users need confidence that the parsed data is traceable to source documents.

MoneyMate solves this by:
- accepting uploads from multiple financial document sources,
- extracting records automatically,
- allowing manual edits and overrides,
- tracking ingestion confidence,
- showing balances, cashflow, and stock activity in one interface.

---

# 3. Goals and Non-Goals

## 3.1 Product Goals

### Primary Goals
1. Allow users to upload financial documents and convert them into structured financial records.
2. Display a unified financial dashboard across expenses, income, bank balances, investments, and stock activity.
3. Allow users to manually add, edit, and correct records.
4. Preserve source-document traceability and user trust.
5. Provide searchable, filterable, and auditable financial timelines.
6. Support imported stock activity statements as a first-class data type.

### Secondary Goals
1. Categorize transactions automatically.
2. Detect duplicate uploads and duplicate transactions.
3. Provide monthly summaries and trend analytics.
4. Provide reconciliation workflows for balances and transactions.
5. Support multi-account and multi-document financial history.

## 3.2 Non-Goals (Initial Version)
1. No direct broker trade execution.
2. No automated tax filing.
3. No accounting double-entry system for business accounting in v1.
4. No multi-user household collaboration in v1.
5. No open banking integration required in v1.
6. No real-time stock market pricing required in v1 unless later added.
7. No advanced AI financial advice engine in v1.

---

# 4. Target Users

## 4.1 Primary User
An individual user who wants to manage personal finances by uploading financial documents and manually tracking money.

## 4.2 Secondary User
A retail investor who wants to combine cash tracking with stock activity tracking from broker statements.

## 4.3 User Characteristics
- not necessarily highly technical
- wants trustworthy records
- wants editable automation
- wants visibility into historical financial changes
- may have multiple bank and investment accounts
- may rely on PDFs or images rather than direct account integrations

---

# 5. User Jobs To Be Done

1. “When I upload a bank statement, I want MoneyMate to extract the transactions so I do not need to input them manually.”
2. “When I upload a stock activity statement, I want MoneyMate to extract my buys, sells, balances, and profit/loss per activity.”
3. “When parsing is uncertain, I want to review and correct it before it affects my dashboard.”
4. “I want to see my total financial position across cash and investments.”
5. “I want to add manual records for transactions not found in uploaded documents.”
6. “I want to compare my month-to-month expenses and income.”
7. “I want to view account balances over time.”
8. “I want a transaction timeline with filters.”
9. “I want a document archive with parsing status, source metadata, and extracted records.”
10. “I want confidence that any number in the dashboard can be traced back to where it came from.”

---

# 6. Functional Scope

## 6.1 Core Modules
MoneyMate v1 should include these core modules:

1. **Authentication and user accounts**
2. **Document upload and ingestion**
3. **Document parsing pipeline**
4. **Financial data normalization**
5. **Manual record entry and editing**
6. **Dashboard and analytics**
7. **Accounts and balances**
8. **Investment / stock activity**
9. **Reconciliation and review**
10. **Search, filters, export, and audit logs**

---

# 7. Information Architecture

## 7.1 Top-Level Navigation
- Dashboard
- Transactions
- Accounts
- Investments
- Documents
- Review Queue
- Reports
- Settings

## 7.2 Recommended Dashboard Sections
- Net Position Summary
- Income Summary
- Expense Summary
- Bank Balances
- Investment Balances
- Monthly Cashflow
- Recent Transactions
- Recent Uploaded Documents
- Parsing Alerts / Review Needed
- Stock Activity Summary

---

# 8. Financial Data Domain Model

MoneyMate should unify all financial information under a normalized financial model.

## 8.1 Core Entities
- User
- Document
- DocumentVersion
- DocumentExtractionJob
- ParsedField
- Account
- AccountSnapshot
- Transaction
- TransactionLine
- InvestmentAccount
- Security
- SecurityLot
- TradeActivity
- CorporateAction
- HoldingSnapshot
- Category
- Merchant / Counterparty
- ManualAdjustment
- ReconciliationSession
- AuditEvent

## 8.2 Financial Object Types

### 8.2.1 Expense
Money leaving the user’s ownership.

Examples:
- debit card purchase
- transfer out
- bill payment
- fee
- withdrawal
- broker fee
- tax fee

### 8.2.2 Income
Money entering the user’s ownership.

Examples:
- salary
- transfer in
- refund
- dividend
- interest
- stock sale proceeds
- reimbursement

### 8.2.3 Regular Bank Balance
The balance of non-investment cash accounts.

Examples:
- checking
- savings
- e-wallet
- cash management account used as daily banking

### 8.2.4 Investment Bank Balance
Cash balance held inside brokerage / investment-related accounts.

Examples:
- broker settlement account
- RDN / cash account linked to broker
- investment cash wallet

### 8.2.5 Stock Activity
Security-related activities extracted from broker documents.

Examples:
- buy
- sell
- IPO allotment
- warrant distribution
- corporate action
- expiration
- end balance
- beginning balance
- realized profit/loss events

---

# 9. Source Documents Supported

## 9.1 Supported Upload Types
- PDF
- image files (JPG, JPEG, PNG, WEBP)
- CSV
- XLSX (future-ready)
- TXT (optional)
- manual form entry

## 9.2 Input Modes
### Automatic Input
Document is uploaded and processed through parsing pipeline.

### Manual Input
User fills forms to add:
- income
- expense
- account balance
- stock activity
- holdings
- cash adjustments
- account snapshots

### Semi-Automatic Input
System extracts records and user confirms/edits them before posting.

---

# 10. Document Ingestion Pipeline

## 10.1 Pipeline Stages
1. Upload
2. File storage
3. File fingerprinting
4. OCR / text extraction if needed
5. Document classification
6. Metadata extraction
7. Structured parsing
8. Field confidence scoring
9. Duplicate detection
10. Review workflow
11. Commit to ledger / portfolio models
12. Audit trail generation

## 10.2 Document Classification Types
- bank statement
- e-wallet statement
- credit card statement
- salary slip
- receipt / invoice
- stock activity statement
- portfolio summary
- dividend statement
- tax document
- unknown financial document

## 10.3 Duplicate Detection Rules
The system should detect duplicates based on:
- file hash
- same filename + same size + same user + same upload window
- identical document metadata
- identical extracted activity rows
- identical account statement period

---

# 11. Stock Activity Reference Parsing Specification

## 11.1 Why Stock Activity Is Important
The user stated that the currently available reference documents are stock activity documents. Therefore, the stock activity parser should be treated as one of the most detailed and production-ready parsers in v1.

## 11.2 Reference Document Characteristics
From the provided stock activity statement, the parser should be able to identify data such as:

- statement title / document type
- period range
- client identity
- client code
- SID
- SRE / RDN
- office / broker
- stock sections
- ticker
- company / security name
- currency
- rows of activity
- date
- settle date
- custody / transaction reference number
- description
- price
- volume
- balance
- average price
- stock value
- profit / loss
- per-security totals
- grand total

## 11.3 Example Reference Fields Observed
The uploaded stock activity statement includes fields such as:
- “CLIENT STOCK ACTIVITY”
- period range from 01-Jan-2024 to 31-Dec-2024
- SID
- Client Code
- SRE / RDN
- stock sections like ACRO, ACRO-W, ASLI, GRPH, MANG, NICE, SMLE, etc.
- activity descriptions like IPO Allotment, Sell, Distribusi E-IPO, Warrant Expired, Beginning Balance, End Balance
- a “Grand Total” line

This reference structure should guide the design of the parser and the database for investment activity.

## 11.4 Parser Requirements for Stock Activity Documents
The parser must:
1. split the document into security sections,
2. identify the ticker and instrument name,
3. preserve original text blocks,
4. parse tabular rows even if OCR spacing is inconsistent,
5. parse numeric columns safely,
6. parse date and settle date independently,
7. understand that volume may be positive or negative,
8. infer transaction type from description and volume sign,
9. capture balance-after-transaction,
10. capture realized profit/loss when present,
11. compute normalized trade entries,
12. store raw row text for traceability.

## 11.5 Stock Activity Row Types to Support
- Beginning Balance
- End Balance
- Buy
- Sell
- IPO Allotment
- Corporate Distribution
- Warrant Distribution
- Warrant Expiry
- Corporate Action
- Unknown Activity

## 11.6 Normalization Logic for Row Types

### Beginning Balance
Should update holding baseline for the security at the start of the statement period.

### End Balance
Should update end-of-period holding state.

### Buy / IPO Allotment
Creates or adds to holdings.
Usually increases quantity.
May set or affect cost basis.

### Sell
Reduces holdings.
Should create realized P/L entries where available.
If P/L is absent, system may compute realized P/L from cost basis if enabled.

### Warrant Distribution
Creates a new security holding entry, usually at very low or nominal average cost.

### Warrant Expiry
Reduces quantity to zero for expired warrants and should be recorded as a non-cash investment event rather than a normal expense.

## 11.7 Stock Activity Data Quality Rules
- Preserve all raw values exactly as parsed.
- Store normalized numeric values separately.
- Support null settle date for malformed rows.
- Reject rows only when all critical identifiers are missing.
- Flag row for review when:
  - date missing
  - ticker missing
  - numeric parse fails
  - row structure mismatch
  - totals don’t reconcile

## 11.8 Reconciliation Rules for Stock Activity
Per-security reconciliation checks:
- sum of row volume changes should match ending quantity relative to beginning quantity
- parsed row totals should align with section total if available
- grand total should be captured and stored
- statement period should be stored explicitly

---

# 12. Product Features in Detail

## 12.1 Authentication and User Management
### Requirements
- email/password auth
- secure session handling
- forgot password
- optional OAuth later
- per-user data isolation
- user profile settings
- preferred currency
- locale-aware date and number formatting

## 12.2 Dashboard
### Key Metrics
- total net worth
- total cash
- total investments
- current regular bank balance
- current investment bank balance
- monthly income
- monthly expenses
- monthly savings
- number of documents processed
- documents requiring review

### Dashboard Widgets
- cashflow line chart
- expense by category
- income by source
- balance trend chart
- investment activity summary
- holdings summary
- top recent expenses
- recent stock activity
- parsing confidence alerts

## 12.3 Transactions Module
### Features
- list all normalized transactions
- filter by date range
- filter by account
- filter by category
- filter by amount
- filter by source document
- filter by type: income / expense / transfer / adjustment / investment
- search by merchant / description / ticker / document

### Transaction Fields
- date
- posting date
- type
- category
- amount
- direction
- description
- account
- source document
- counterparty
- confidence score
- review status
- tags
- notes

## 12.4 Accounts Module
### Features
- list all accounts
- differentiate regular bank vs investment bank
- show current balance
- show balance history
- show imported statement history
- reconcile snapshots against transactions

### Account Types
- bank_account
- ewallet_account
- credit_account
- investment_cash_account
- brokerage_account
- manual_cash_account

## 12.5 Investments Module
### Features
- holdings list
- stock activity timeline
- realized P/L view
- per-security detail page
- broker account detail page
- uploaded stock statement traceability
- investment account cash balance
- manual stock activity entry

### Security Detail Page
- ticker
- full name
- instrument type
- activity timeline
- beginning balance entries
- ending balance entries
- buys
- sells
- corporate actions
- realized P/L summary
- open quantity
- average cost basis
- linked source rows

## 12.6 Documents Module
### Features
- upload documents
- drag and drop
- batch upload
- document status badges
- parse status
- extracted type
- extracted metadata
- original preview
- parser confidence
- duplicate warning
- review required queue
- archival access

### Document Statuses
- uploaded
- processing
- parsed
- needs_review
- approved
- rejected
- duplicate
- failed

## 12.7 Review Queue
### Purpose
A place for users to confirm uncertain extraction before it updates financial summaries.

### Features
- list flagged fields
- compare raw text vs parsed value
- accept suggestion
- edit value
- ignore row
- merge duplicate
- rerun parser
- approve document
- reject document

## 12.8 Manual Entry
### Supported Manual Forms
- expense entry
- income entry
- account balance snapshot
- bank transfer
- stock buy
- stock sell
- dividend
- stock corporate action
- holding correction
- manual cash adjustment

### Manual Entry UX Requirements
- fast entry
- defaults for common fields
- repeat recurring entries
- optional note and attachments
- mark manual records clearly as manual source

## 12.9 Reports
### Core Reports
- monthly income vs expense
- category spending report
- account balance over time
- investment activity report
- realized P/L by security
- upload processing report
- unreconciled items report

---

# 13. User Stories

## 13.1 Uploading Documents
- As a user, I want to upload a stock activity PDF so that MoneyMate can extract my trade records.
- As a user, I want to upload expense statements so that MoneyMate can automatically categorize spending.
- As a user, I want to see whether my document has been parsed successfully.

## 13.2 Reviewing Parsed Data
- As a user, I want to review uncertain parsed fields before they affect my dashboard.
- As a user, I want to compare extracted values with the raw source document.

## 13.3 Viewing Finances
- As a user, I want to view all my income and expenses in one timeline.
- As a user, I want to separate regular bank balances from investment cash balances.
- As a user, I want to see stock activity details by ticker and by date.

## 13.4 Editing Data
- As a user, I want to manually correct a parser mistake.
- As a user, I want to add transactions that do not exist in uploaded files.
- As a user, I want to create manual balance snapshots.

## 13.5 Trust and Audit
- As a user, I want every record to show where it came from.
- As a user, I want to know whether a record was auto-generated, corrected, or manually entered.

---

# 14. UX Requirements

## 14.1 UX Principles
- clarity over cleverness
- auditability over hidden automation
- review-first when confidence is low
- fast navigation between source document and normalized record
- visual distinction between cash and investments
- no silent overwrites

## 14.2 Key UX Patterns
- cards for top-level summaries
- tables for transaction-heavy views
- drawers/modals for inline edits
- side-by-side source preview and parsed data in review mode
- timeline views for transaction and stock activity history
- color-safe indicators for positive/negative values
- sticky filters on large datasets

## 14.3 Empty States
Examples:
- “No documents uploaded yet”
- “No transactions found for this month”
- “No stock activity parsed yet”
- “No items require review”

## 14.4 Error States
Examples:
- failed upload
- parser failed
- duplicate document detected
- unsupported file format
- no extractable financial data
- malformed numbers/dates

---

# 15. Recommended Pages and Routes

## Public
- `/`
- `/login`
- `/register`
- `/forgot-password`

## App
- `/app/dashboard`
- `/app/transactions`
- `/app/transactions/:id`
- `/app/accounts`
- `/app/accounts/:id`
- `/app/investments`
- `/app/investments/securities/:ticker`
- `/app/investments/activity`
- `/app/documents`
- `/app/documents/:documentId`
- `/app/review`
- `/app/reports`
- `/app/settings`

---

# 16. Technical Architecture

## 16.1 Recommended Stack
### Frontend
- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- TanStack Table
- TanStack Query
- Recharts
- Zod
- React Hook Form

### Backend
- Next.js route handlers or separate Node backend
- TypeScript
- PostgreSQL
- Prisma ORM
- object storage for uploaded files
- background job queue for parsing
- document parser services

### Infrastructure
- Vercel for frontend
- Postgres (Neon / Supabase / Railway / managed PostgreSQL)
- object storage (S3-compatible)
- worker service for parsing
- Redis optional for queue / caching

## 16.2 Suggested Architecture Style
- modular monolith for v1
- service-oriented boundaries inside codebase
- asynchronous document parsing jobs
- event-driven ingestion updates where useful

---

# 17. Backend Capability Requirements

## 17.1 Core API Domains
- auth
- documents
- parsing jobs
- transactions
- accounts
- balances
- investments
- securities
- manual entries
- categories
- reports
- audit logs

## 17.2 API Design Principles
- typed request/response contracts
- idempotent ingestion where possible
- pagination for tables
- filterable endpoints
- immutable raw extracted rows
- mutable normalized records with audit trail
- role-based ownership checks

---

# 18. Database Schema Blueprint

## 18.1 users
- id
- email
- password_hash
- display_name
- preferred_currency
- locale
- created_at
- updated_at

## 18.2 documents
- id
- user_id
- filename
- original_mime_type
- storage_key
- sha256_hash
- file_size_bytes
- upload_source
- document_type
- statement_start_date
- statement_end_date
- parse_status
- duplicate_of_document_id
- parser_version
- overall_confidence
- needs_review
- uploaded_at
- processed_at

## 18.3 document_metadata
- id
- document_id
- key
- value_text
- value_json

## 18.4 extraction_jobs
- id
- document_id
- status
- stage
- error_message
- started_at
- finished_at
- raw_text
- ocr_text
- extracted_json

## 18.5 parsed_fields
- id
- document_id
- extraction_job_id
- field_path
- raw_value
- normalized_value
- confidence
- requires_review
- page_number
- source_bbox_json
- created_at

## 18.6 accounts
- id
- user_id
- name
- institution_name
- account_type
- account_subtype
- currency
- masked_account_number
- external_reference
- is_active
- created_at
- updated_at

## 18.7 account_snapshots
- id
- account_id
- snapshot_date
- balance
- available_balance
- source_document_id
- source_type
- confidence
- created_at

## 18.8 transactions
- id
- user_id
- account_id
- source_document_id
- source_row_id
- source_type
- transaction_type
- direction
- transaction_date
- posting_date
- amount
- currency
- description
- normalized_description
- category_id
- merchant_name
- counterparty_name
- review_status
- confidence
- is_manual
- created_at
- updated_at

## 18.9 categories
- id
- user_id
- name
- parent_category_id
- category_type
- color_token
- is_system

## 18.10 securities
- id
- user_id
- ticker
- security_name
- exchange
- instrument_type
- currency
- is_active
- created_at
- updated_at

## 18.11 investment_accounts
- id
- user_id
- account_id
- broker_name
- sid
- client_code
- sre
- rdn
- office_name
- salesperson
- created_at
- updated_at

## 18.12 trade_activities
- id
- user_id
- investment_account_id
- security_id
- source_document_id
- activity_date
- settle_date
- external_reference
- activity_type
- raw_description
- quantity
- price
- balance_after
- average_price_after
- market_value_after
- realized_profit_loss
- currency
- confidence
- requires_review
- raw_row_json
- created_at
- updated_at

## 18.13 holding_snapshots
- id
- user_id
- investment_account_id
- security_id
- snapshot_date
- quantity
- average_cost
- market_value
- source_document_id
- created_at

## 18.14 manual_adjustments
- id
- user_id
- target_type
- target_id
- reason
- delta_json
- created_at

## 18.15 audit_events
- id
- user_id
- entity_type
- entity_id
- action_type
- before_json
- after_json
- actor_type
- created_at

---

# 19. Parsing and Normalization Rules

## 19.1 Normalization Principles
1. Never destroy raw source data.
2. Normalize into canonical record types.
3. Store parser confidence.
4. Preserve linkage from normalized record to source row and source document.
5. Allow post-parse user edits with audit history.
6. Keep parser deterministic where possible.

## 19.2 Numeric Parsing Rules
- support commas as thousand separators
- support parentheses for negative values if present
- strip currency symbols
- store decimal as high-precision numeric
- avoid floating point for money

## 19.3 Date Parsing Rules
- parse document locale-aware dates
- preserve raw date text
- normalize to ISO date
- distinguish transaction date vs settle date
- allow null when missing

## 19.4 Confidence Scoring Inputs
- document classification confidence
- field extraction pattern confidence
- column alignment confidence
- row completeness
- duplicate similarity
- numeric reconciliation checks

## 19.5 Review Triggers
- low-confidence document type
- missing key metadata
- inconsistent totals
- suspicious duplicate
- missing account mapping
- unrecognized row type
- unsupported instrument format

---

# 20. Analytics Requirements

## 20.1 Expense Analytics
- monthly total expenses
- expense trend
- expense by category
- largest expenses
- recurring expenses

## 20.2 Income Analytics
- monthly total income
- income by source
- irregular vs regular income

## 20.3 Balance Analytics
- total cash
- total investments
- net worth trend
- account-by-account balance trend

## 20.4 Investment Analytics
- activity count by month
- realized P/L by security
- open holdings
- quantity changes over time
- warrant expiry events
- IPO activity summary

---

# 21. Security and Privacy Requirements

## 21.1 Security Requirements
- hashed passwords
- HTTPS only
- encrypted secrets
- signed upload URLs or protected upload flow
- authorization checks on all data
- secure file storage
- server-side validation
- rate limiting
- audit logs for critical changes

## 21.2 Privacy Requirements
- user data isolated by user ID
- no document visible to other users
- sensitive document metadata protected
- minimal PII exposure in UI
- delete/export data capability
- clear document retention policy

---

# 22. Performance Requirements

## 22.1 Performance Goals
- dashboard initial load should feel fast
- upload should begin immediately with progress feedback
- document status should update asynchronously
- transaction tables should support pagination and filtering efficiently
- large document parsing should not block the UI thread

## 22.2 Scalability Expectations
For v1, optimize for:
- single-user datasets up to thousands of transactions
- hundreds of uploaded documents per user
- hundreds to thousands of stock activity rows

---

# 23. Error Handling Requirements

## 23.1 Upload Errors
- unsupported format
- corrupted file
- oversized file
- failed storage

## 23.2 Parse Errors
- unreadable OCR
- unrecognized document type
- partial parse
- row extraction failure
- total mismatch

## 23.3 User-Friendly Messaging
Every failure should show:
- what failed
- whether data was partially extracted
- what the user can do next
- whether manual correction is possible

---

# 24. Admin / Internal Operational Considerations
Even if hidden in v1 UI, system should support:
- parser versioning
- parser logs
- reprocess document
- inspect extraction payload
- compare parser output versions
- monitor job failures

---

# 25. MVP Release Scope

## 25.1 Must-Have
- auth
- upload documents
- stock activity PDF parsing
- manual expense/income entry
- accounts and balances
- document archive
- review queue
- dashboard
- transaction list
- stock activity list
- source traceability

## 25.2 Nice-to-Have
- auto-categorization
- document preview annotations
- CSV import
- recurring transaction suggestions
- holdings charts
- export to CSV

---

# 26. Future Enhancements
- multi-broker support with custom parser templates
- AI categorization assistant
- multi-currency support with FX normalization
- market price integrations for current portfolio valuation
- household/shared finance mode
- recurring bills prediction
- tax-lot analysis
- dividend analytics
- mobile app
- email-based ingestion

---

# 27. Acceptance Criteria

## 27.1 Core Acceptance Criteria
1. User can upload a stock activity PDF.
2. System stores file and creates processing job.
3. System classifies it as stock activity statement.
4. System extracts statement metadata.
5. System parses security sections and rows.
6. System normalizes rows into trade/activity records.
7. System displays parsed results in review or approved state.
8. User can edit incorrect rows.
9. Dashboard updates after approval.
10. Every normalized record links back to a source document.

## 27.2 Stock Activity Acceptance Criteria
1. Parser supports beginning balance and end balance rows.
2. Parser supports buy/sell/IPO/warrant-related activities.
3. Parser captures price, quantity, balance-after, average price, market value, and realized P/L where present.
4. Per-security totals are stored.
5. Grand total is captured when available.
6. User can view activity grouped by security.
7. User can see original raw description for every row.

---

# 28. Fullstack Website Development Prompts

Below are highly detailed prompts that can be given to a coding LLM, internal engineering team, or AI agent to build MoneyMate.

---

## Prompt 1 — Master Fullstack Build Prompt

```md
Build a production-ready fullstack web application named **MoneyMate**.

### Product Summary
MoneyMate is a personal finance website that lets users upload financial documents and manually enter data to analyze:
- expenses
- income
- regular bank balances
- investment bank balances
- stock activity

The system must support both:
1. automatically inputted document uploads
2. manually inputted finance records

The uploaded financial documents must be converted into structured, auditable records. The current strongest reference document type is a **stock activity statement PDF** from a broker, so the investment ingestion system must be especially robust.

### Core Product Requirements
Create an app with the following modules:
- authentication
- dashboard
- documents upload/archive
- parser processing status
- review queue
- transactions
- accounts
- investments
- reports
- settings

### Required Stack
Use:
- Next.js (latest stable, App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Prisma
- React Hook Form
- Zod
- TanStack Query
- TanStack Table

### Architectural Requirements
- Build as a modular monolith
- Keep parser/ingestion flow asynchronous
- Use background job processing abstraction
- Keep raw extracted document data immutable
- Keep normalized records editable with audit history
- Preserve linkage between normalized records and source document rows

### Main UX Requirements
- Clean, premium, modern dashboard
- Fast, highly legible tables
- Strong review workflow
- Side-by-side source document and parsed values where possible
- Clear distinction between cash, account balances, and investments
- User-friendly empty states and error states

### Main Data Domains
Implement database models and API flows for:
- users
- documents
- extraction jobs
- parsed fields
- accounts
- account snapshots
- transactions
- categories
- securities
- investment accounts
- trade activities
- holding snapshots
- manual adjustments
- audit events

### Required Pages
- /login
- /register
- /app/dashboard
- /app/documents
- /app/documents/[id]
- /app/review
- /app/transactions
- /app/accounts
- /app/accounts/[id]
- /app/investments
- /app/investments/activity
- /app/investments/securities/[ticker]
- /app/reports
- /app/settings

### Functional Requirements
1. User authentication with protected app routes
2. File upload with drag-and-drop
3. Store uploaded files and metadata
4. Create extraction jobs after upload
5. Parse stock activity documents into normalized investment activity
6. Allow manual expense/income/balance/stock activity entry
7. Show review queue for low-confidence fields
8. Allow user corrections before final approval
9. Show dashboard analytics for income, expense, balances, and stock activity
10. Provide audit trails for user edits and parser outputs

### Stock Activity Parser Requirements
Design the parser to handle:
- statement title
- statement date range
- broker/client metadata
- SID
- client code
- SRE / RDN
- office
- security sections
- ticker and security name
- activity rows with:
  - date
  - settle date
  - reference number
  - description
  - price
  - volume
  - balance
  - average price
  - stock value
  - profit/loss
- section totals
- grand total

### Investment Activity Types to Support
- Beginning Balance
- End Balance
- Buy
- Sell
- IPO Allotment
- Warrant Distribution
- Warrant Expiry
- Corporate Action
- Unknown Activity

### Data Integrity Requirements
- Never overwrite raw source text
- Store raw row data
- Store normalized row data
- Store parser confidence
- Flag uncertain rows for review
- Ensure normalized row links back to document and source row

### Output Requirements
Generate:
1. project folder structure
2. Prisma schema
3. SQL migration notes
4. API routes
5. server actions or route handlers
6. UI components
7. page implementations
8. parsing service interfaces
9. seed data
10. mock parser data
11. reusable types
12. validation schemas
13. example dashboard widgets

### Code Quality Requirements
- strict TypeScript
- reusable components
- clean domain-based organization
- good naming
- comments only where needed
- no placeholder pseudo-code in core flows
- production-grade error handling
- safe numeric handling for money

### Deliverable Expectations
Return the solution in implementation order:
1. architecture overview
2. folder tree
3. Prisma schema
4. utility types
5. backend services
6. API handlers
7. frontend pages
8. reusable components
9. parser abstraction
10. sample parser implementation for stock activity
11. testing strategy
12. deployment notes
```

---

## Prompt 2 — Product Manager / PRD-to-Build Prompt

```md
Act as a senior product manager and software architect. Turn the following product into a complete engineering specification and execution-ready build plan.

Product name: MoneyMate

MoneyMate is a personal finance website for individual users. It should allow users to upload financial documents and also manually enter financial data. The system should analyze and display:
- expenses
- income
- regular bank balances
- investment bank balances
- stock activity

The system should support:
- automatic extraction from uploaded documents
- manual data entry and correction
- source traceability
- dashboard analytics
- review workflow for low-confidence parsing

The currently available reference document format is a stock activity statement from a brokerage, with fields such as:
- statement period
- client code
- SID
- SRE/RDN
- security sections
- date
- settle date
- description
- price
- volume
- balance
- average price
- stock value
- profit/loss
- per-security totals
- grand total

Create a complete build specification including:
- product requirements
- user stories
- edge cases
- page map
- user flows
- API design
- DB schema
- validation rules
- parsing logic
- UI components
- access control
- review workflows
- audit logging
- testing plan
- deployment plan
- phased roadmap

Be extremely detailed and implementation-oriented.
```

---

## Prompt 3 — Frontend Build Prompt

```md
Build the frontend for a web application called MoneyMate using:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Table
- TanStack Query
- Recharts

### App Purpose
MoneyMate helps users manage personal finances by displaying:
- expenses
- income
- regular bank balances
- investment bank balances
- stock activity
from uploaded documents and manual entries.

### Frontend Requirements
Create the following pages:
- login/register
- dashboard
- documents
- document detail
- review queue
- transactions
- accounts
- account detail
- investments
- investment activity
- security detail
- reports
- settings

### UI Requirements
The design should feel:
- clean
- modern
- premium
- data-dense but readable
- trustworthy and finance-focused

### Dashboard UI
Include cards/charts/tables for:
- total net worth
- total cash
- total investments
- monthly income
- monthly expenses
- monthly savings
- balance trend
- expense categories
- recent transactions
- recent uploaded documents
- stock activity summary
- review-needed alerts

### Documents UI
Include:
- drag-and-drop upload area
- document table
- status badges
- parser confidence display
- duplicate indicator
- filter/search
- detail page with metadata and extracted results

### Review Queue UI
Include:
- list of flagged fields
- compare raw value vs normalized value
- edit form
- accept/reject controls
- document status change controls

### Transactions UI
Include:
- table with sorting/filtering/pagination
- filters by date, amount, category, account, source document
- row detail drawer
- edit modal

### Investments UI
Include:
- holdings summary cards
- activity table
- realized P/L summary
- security drill-down page
- source-document traceability

### Component Requirements
Build reusable components for:
- metric cards
- section headers
- filters bar
- upload dropzone
- status badges
- confidence badge
- data table wrapper
- chart card
- empty state
- error state
- review diff card
- raw source viewer
- manual entry form dialog

### Technical Requirements
- use typed interfaces
- use loading skeletons
- use optimistic or responsive interactions where safe
- use URL query params for filter state where useful
- implement responsive layouts
- ensure accessibility basics
```

---

## Prompt 4 — Backend/API Prompt

```md
Build the backend for MoneyMate using TypeScript, PostgreSQL, Prisma, and Next.js route handlers or a modular Node backend.

### Product Scope
MoneyMate is a personal finance website with support for:
- document uploads
- parsing jobs
- expenses
- income
- bank balances
- investment bank balances
- stock activity
- manual entries
- review workflows
- audit trails

### Implement APIs and services for:
1. authentication
2. document upload registration
3. document metadata storage
4. extraction job creation and tracking
5. parsed field review
6. transaction CRUD
7. account CRUD
8. account snapshot CRUD
9. investment account CRUD
10. securities lookup
11. trade activities CRUD
12. reports/aggregations
13. duplicate detection
14. audit logging

### Required Backend Principles
- strict ownership checks by user
- no cross-user data access
- input validation with Zod
- structured error handling
- paginated queries for tables
- deterministic normalization logic
- immutable raw extraction payloads
- audit logs for user edits and approvals

### Required API Endpoints (suggested)
- POST /api/documents/upload/init
- POST /api/documents
- GET /api/documents
- GET /api/documents/:id
- POST /api/documents/:id/reprocess
- POST /api/documents/:id/approve
- POST /api/documents/:id/reject

- GET /api/review
- PATCH /api/review/field/:id

- GET /api/transactions
- POST /api/transactions
- PATCH /api/transactions/:id
- DELETE /api/transactions/:id

- GET /api/accounts
- POST /api/accounts
- PATCH /api/accounts/:id

- GET /api/investments/activity
- POST /api/investments/activity
- PATCH /api/investments/activity/:id

- GET /api/dashboard/summary
- GET /api/reports/cashflow
- GET /api/reports/investments

### Required Service Layer Modules
- document service
- extraction service
- classification service
- normalization service
- review service
- transaction service
- account service
- investment service
- reporting service
- audit service

### Required Database Outputs
Produce a Prisma schema covering the full domain, including:
- users
- documents
- extraction jobs
- parsed fields
- accounts
- account snapshots
- transactions
- categories
- securities
- investment accounts
- trade activities
- holding snapshots
- manual adjustments
- audit events

### Deliver production-grade implementation with strong types and clear module boundaries.
```

---

## Prompt 5 — Stock Activity Parser Prompt

```md
Create a document parser module for MoneyMate focused on parsing stock activity statement PDFs.

### Context
MoneyMate is a personal finance system that ingests financial documents and normalizes them into structured records. The strongest current reference document is a broker stock activity statement.

### Goal
Build a robust parser that can take extracted text from a stock activity PDF and return:
- statement metadata
- broker/client metadata
- security sections
- normalized activity rows
- validation issues
- confidence scores
- totals

### The parser must recognize:
- document title
- date range
- SID
- Client Code
- SRE / RDN
- office
- salesperson
- stock ticker
- security name
- currency
- row table columns:
  - date
  - settle date
  - custody/reference number
  - description
  - price
  - volume
  - balance
  - avg price
  - stock value
  - profit / loss
- per-security total
- grand total

### Output Shape
Return a JSON object with:
- documentType
- statementPeriod
- accountMetadata
- securities[]
- validationIssues[]
- grandTotals
- parserConfidence

Each security entry should include:
- ticker
- securityName
- currency
- rows[]
- totals

Each row should include:
- rawRowText
- activityDate
- settleDate
- referenceNumber
- description
- activityType
- price
- quantity
- balanceAfter
- averagePriceAfter
- marketValueAfter
- realizedProfitLoss
- confidence
- requiresReview

### Parsing Constraints
- OCR spacing may be inconsistent
- some rows may wrap lines
- dates may appear only once before continuation lines
- security headers may include company names and CCY
- quantity may be negative for sells/expiry
- some corporate actions may not resemble normal buy/sell rows

### Required Features
- section splitting
- multiline row reconstruction
- tolerant numeric parsing
- rule-based activity type classification
- reconciliation checks
- issue reporting
- raw-source preservation

### Also include:
- parser architecture
- helper functions
- unit test cases
- example input/output
- edge case handling
- confidence scoring logic
```

---

## Prompt 6 — Database/Schema Prompt

```md
Design a PostgreSQL + Prisma schema for a web application called MoneyMate.

MoneyMate is a personal finance app that manages:
- expenses
- income
- regular bank balances
- investment bank balances
- stock activity
- uploaded documents
- parsing jobs
- review workflows
- audit logs

### Requirements
The schema must support:
- user ownership
- document storage metadata
- immutable raw extraction payloads
- editable normalized financial records
- manual entries
- multiple account types
- broker/investment accounts
- securities and trade activities
- account snapshots
- parsed field confidence and review status
- traceability to source document and source row
- audit events for changes

### Deliverables
- Prisma models
- enums
- indexes
- unique constraints
- relation design
- notes on cascade strategy
- notes on query patterns
- examples of important queries:
  - dashboard summary
  - monthly cashflow
  - stock activity by ticker
  - documents needing review
  - duplicate upload detection
```

---

## Prompt 7 — QA/Test Prompt

```md
Create a complete QA and testing strategy for MoneyMate, a personal finance web application.

### Product Scope
MoneyMate supports:
- uploaded financial documents
- manual entries
- document parsing
- review workflows
- financial dashboard
- account balances
- investment activity
- stock activity statements

### Testing Scope
Create detailed test plans for:
- auth
- file uploads
- document classification
- extraction jobs
- stock activity parser
- manual transaction entry
- review queue edits
- account and balance calculations
- dashboard summaries
- permissions and security
- duplicate detection
- audit logs

### Include
- unit tests
- integration tests
- end-to-end tests
- parser fixture tests
- regression tests
- edge cases
- malformed file handling
- data reconciliation tests
- large dataset tests

### Key Stock Parser Test Scenarios
- beginning balance rows
- end balance rows
- sell rows with negative volume
- IPO allotment rows
- warrant distribution rows
- warrant expiry rows
- multiline wrapped descriptions
- inconsistent spacing
- total mismatch warnings
- duplicate document upload
```

---

## Prompt 8 — Deployment/DevOps Prompt

```md
Create a deployment architecture and DevOps plan for MoneyMate.

### App Summary
MoneyMate is a fullstack web app for personal finance and stock activity analysis from uploaded documents.

### Stack
- Next.js
- TypeScript
- PostgreSQL
- Prisma
- object storage
- background parsing jobs

### Requirements
Provide:
- environment architecture
- dev/staging/prod setup
- secret management approach
- database migration workflow
- object storage setup
- file upload strategy
- background worker deployment
- logging/monitoring
- parser failure alerting
- backup strategy
- security hardening checklist
- CI/CD pipeline
- release checklist
- rollback strategy

### Special Requirements
- protect sensitive uploaded financial documents
- ensure asynchronous parsing job reliability
- support reprocessing documents after parser version updates
```

---

# 29. Suggested Build Order

## Phase 1 — Foundations
- auth
- DB schema
- app shell
- upload infrastructure
- document storage
- audit scaffolding

## Phase 2 — Stock Activity MVP
- stock statement classification
- parser implementation
- review queue
- investments pages
- activity tables
- document detail page
- source traceability

## Phase 3 — Cashflow Tracking
- manual income/expense entry
- account module
- account snapshots
- transaction timeline
- dashboard cash metrics

## Phase 4 — Reporting and Polish
- analytics
- charts
- filters
- duplicate detection
- parser confidence improvements
- exports

---

# 30. Suggested Folder Structure

```txt
moneymate/
  app/
    (auth)/
      login/
      register/
    app/
      dashboard/
      documents/
        [id]/
      review/
      transactions/
      accounts/
        [id]/
      investments/
        activity/
        securities/
          [ticker]/
      reports/
      settings/
    api/
      documents/
      review/
      transactions/
      accounts/
      investments/
      dashboard/
      reports/
  components/
    dashboard/
    documents/
    review/
    tables/
    forms/
    investments/
    accounts/
    layout/
    shared/
  lib/
    auth/
    db/
    validation/
    parsing/
      stock-activity/
    services/
    repositories/
    formatting/
    analytics/
    permissions/
    storage/
    audit/
  prisma/
    schema.prisma
  tests/
    unit/
    integration/
    e2e/
    fixtures/
      stock-activity/
  workers/
    parsing/
  public/
```

---

# 31. Key Product Decisions

## 31.1 Why Review Queue Matters
Financial software must prioritize trust. The app should not silently mutate important values extracted from uncertain documents.

## 31.2 Why Raw + Normalized Models Both Matter
Raw extraction preserves source truth.
Normalized records power analytics and user-friendly UX.

## 31.3 Why Stock Activity Needs a Dedicated Model
Stock documents contain security-level activity, not just normal cash transactions. They need:
- security entities
- broker account metadata
- quantity-based records
- cost basis fields
- realized P/L fields
- holdings logic

---

# 32. Final Notes for the Build Team

MoneyMate should be built as a finance product first, not just a generic file upload dashboard. The most important qualities are:

- trust
- clarity
- editability
- traceability
- correctness
- scalable document ingestion architecture

The existing stock activity reference strongly indicates that the investment data model should be one of the best-defined parts of the first version.

Design the system so that future document types can be added without redesigning the whole ingestion and review system.

---

# 33. Reference Note from Uploaded Stock Activity Document

This PRD and prompt pack were shaped using the uploaded stock activity statement as the reference structure for investment document ingestion. The reference includes statement metadata, broker/client metadata, per-security sections, activity rows, totals, and a grand total, which directly informed the parser and schema requirements in this document.
