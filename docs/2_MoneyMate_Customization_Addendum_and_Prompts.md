# MoneyMate — Customization PRD Addendum + Super Detailed Customization Build Prompts

## Purpose of This Document

This is a **separate file** from the original PRD and fullstack prompt pack.

Its purpose is to define **advanced customization requirements** for **MoneyMate**, especially for:

- investment categories
- stock broker/securities categorization
- broker code tracking
- investment bank balance linking
- regular bank balance categorization
- expense and income views that can be combined or separated across account types
- additional customization controls that make the product more suitable for real-world personal finance workflows

This document should be used as:
1. a **customization addendum** to the main MoneyMate PRD,
2. a **feature extension specification**,
3. a **build prompt pack** for engineering or AI coding agents,
4. a **data-model extension guide**.

---

# 1. Why Customization Matters for MoneyMate

MoneyMate is not just a generic budgeting app. It is a document-driven and manually editable financial management system. Because users can have different financial setups, the app must be highly customizable.

For example:
- one user may have multiple regular bank accounts and one broker-linked investment cash account,
- another user may use several brokers,
- another user may hold stocks, mutual funds, ETFs, and bonds,
- another user may want expenses and income viewed in one combined cashflow dashboard,
- another user may want cashflow split between daily banking and investment-related cash movement.

Without customization, the system becomes too rigid and less trustworthy.

Therefore, MoneyMate should allow users to customize:
- account structures
- investment hierarchies
- broker mappings
- linked accounts
- category taxonomies
- dashboard aggregation logic
- document interpretation defaults
- views, filters, and grouping behavior

---

# 2. Main Customization Requests from User

The following customization needs were explicitly requested and should be treated as high-priority requirements.

## 2.1 Investment Categories
The app should support customizable **investment categories**, such as:
- Stocks
- Mutual Funds
- ETFs
- Bonds
- Crypto (optional depending on future scope)
- Gold / Precious Metals
- REITs
- Government Securities
- Time Deposits
- Other Investments

These categories must be configurable and extensible.

## 2.2 Stock Category Substructure
For the **stock** investment category, the app should support:
- securities / brokerage platforms such as:
  - Ajaib
  - Indo Premier
  - Mirae Asset
  - Stockbit
  - BNI Sekuritas
  - Mandiri Sekuritas
  - Philip Sekuritas
  - Custom broker/securities name
- broker code
- broker account metadata
- client code
- SID
- SRE / RDN
- office / branch
- relationship between stock activity documents and the selected securities entity

This is especially important for stock activity tracking.

## 2.3 Investment Bank Balance Customization
For **investment bank balance**, the app should support:
- bank name
- linked securities / broker
- linked investment account or RDN
- ability to attribute cash balance to one or more investment channels
- optional separation between:
  - investment cash available for trading
  - settlement cash
  - pending withdrawal cash
  - pending deposit cash

## 2.4 Regular Bank Balance Customization
For **regular bank balance**, the app should support:
- bank name
- account nickname
- account type
- bank brand or institution
- optional grouping by:
  - savings
  - checking
  - e-wallet
  - digital bank
  - cash wallet

Examples:
- BCA
- BRI
- Mandiri
- BNI
- CIMB
- Jago
- SeaBank
- GoPay
- OVO
- DANA

## 2.5 Income and Expense Tracking Display Logic
For **expense and income tracking**, users should be able to choose whether to:
- combine regular bank balance and investment bank balance into a unified cashflow view
- separate regular banking cashflow from investment cashflow
- include or exclude investment-related cash movement in expense/income charts
- treat stock sale proceeds as:
  - investment inflow only
  - general income
  - excluded from normal income reporting
- treat broker fees and taxes as:
  - expenses
  - investment costs only
  - hidden from general spending charts

This flexibility is critical because different users interpret investment-related cash movement differently.

---

# 3. Recommended Additional Customizations to Make MoneyMate More Suitable

Below are additional customization capabilities that should be added to make the product more appropriate, more realistic, and more adaptable.

## 3.1 Account Grouping Customization
Users should be able to define custom account groups such as:
- Daily Spending
- Emergency Fund
- Salary Accounts
- Investment Funding Accounts
- Trading Cash Accounts
- Dormant Accounts
- Family Shared Accounts
- Business-Adjacent Personal Accounts

Why this matters:
Users often do not think in raw account types. They think in money purpose buckets.

## 3.2 Category Mapping Customization
Users should be able to customize:
- expense categories
- income categories
- transfer categories
- investment event categories
- broker fee categories
- tax-related categories
- dividend categories

Examples:
- Food & Dining
- Transport
- Utilities
- Shopping
- Salary
- Freelance Income
- Dividends
- Realized Gain
- Broker Fee
- Stamp Duty
- Tax Withholding
- Capital Injection
- Withdrawal from Broker

Why this matters:
Default categories are never enough for all users.

## 3.3 Cashflow Interpretation Rules
Users should be able to define how certain financial movements are classified.

Examples:
- transfer from BCA to RDN: transfer, not expense
- stock sale proceeds to broker cash: not income in general cashflow
- dividend received in RDN: income + investment income
- top-up to broker cash: transfer
- mutual fund subscription: investment transfer, not expense
- broker admin fee: expense
- tax on dividends: expense or tax category
- interest in savings account: income

Why this matters:
The same money movement can be interpreted differently depending on user preference and accounting style.

## 3.4 Instrument-Level Customization
Users should be able to customize investment instrument metadata such as:
- instrument type
- sub-type
- risk profile
- currency
- exchange
- broker default
- account linkage
- display grouping
- whether it is included in net worth charts
- whether current price updates are manual or automatic in future versions

Examples:
- BBCA = Stock
- SBR012 = Government Bond
- Mutual Fund ABC = Mutual Fund
- Gold = Precious Metals

## 3.5 Naming and Alias Customization
Users should be able to assign:
- account nicknames
- security aliases
- custom display names
- category aliases
- broker aliases

Examples:
- “BCA Blue” for one bank account
- “Ajaib Trading” for one broker
- “Emergency Cash” for one savings account
- “Long-term Portfolio” for one holdings group

Why this matters:
Users often remember accounts by personal naming, not institution names alone.

## 3.6 Multi-Level Investment Hierarchy
To make customization more powerful, define this hierarchy:

**Investment Category → Securities/Broker → Investment Cash Account / RDN → Holdings / Stock Activity**

Example:
- Stocks
  - Mirae Asset
    - BCA RDN
    - Portfolio Holdings
  - Ajaib
    - BRI RDN
    - Portfolio Holdings

This structure helps users understand:
- which broker is used,
- which investment bank account funds it,
- which trades belong to which channel.

## 3.7 Statement-to-Account Mapping Rules
Users should be able to configure rules such as:
- stock activity statements with broker code X should map to broker Y
- RDN number ending with 1234 should map to BCA RDN account
- documents containing “Mirae Asset” should default to that broker
- statement source with “Ajaib” should create activity under Ajaib broker profile

Why this matters:
It reduces repetitive manual review and makes future imports smoother.

## 3.8 Manual Override Templates
Users should be able to define reusable overrides:
- always map “IPO Allotment” to activity type IPO
- always map “Distribusi E-IPO” to Corporate Distribution
- always map broker fee descriptions to expense category “Broker Fee”
- always map dividend entries to income category “Dividend”

This becomes a user-level personalization layer.

## 3.9 Reporting Preference Customization
Users should be able to customize what reports include:
- include investment cash in total cash
- exclude unrealized holdings from monthly savings
- include dividends in income charts
- exclude transfers from cashflow analytics
- separate realized gains from salary/operational income
- show net worth by account group
- show stock activity by broker

## 3.10 Dashboard Widget Customization
Users should be able to choose:
- which widgets appear
- which are hidden
- default date range
- default aggregation method
- preferred charts
- combined or separated finance views

Examples:
- show one combined cashflow card
- show separate “Daily Banking Cashflow” and “Investment Cashflow”
- show “Stock Activity by Broker”
- show “Investment Cash Balance by Linked Bank”

## 3.11 Currency and Locale Customization
Even if v1 is mostly single-currency, customization should support:
- preferred display currency
- original currency preservation
- date format
- number separators
- language/label preferences

## 3.12 Tax and Fee Handling Customization
Users should be able to define rules for:
- broker transaction fee treatment
- tax treatment
- dividend withholding
- stamp duty
- levy / exchange fee
- mutual fund subscription fee
- redemption fee

This is useful because some users want these reflected in expenses while others want them kept inside investment cost tracking only.

## 3.13 Transfer Detection Customization
Users should be able to define internal transfer rules between:
- regular banks
- e-wallets
- investment cash accounts
- broker accounts

This helps avoid double counting:
- as expense on one side
- and income on the other side

## 3.14 Balance Inclusion Rules
Users should be able to define:
- which account balances count toward total cash
- which count toward total investments
- which count toward net worth
- which are hidden from main dashboard

Examples:
- petty cash included in total cash
- dormant broker account excluded from dashboard
- family-managed account excluded from personal net worth

## 3.15 Review Threshold Customization
Users should be able to customize parser review thresholds:
- always review new broker documents
- auto-approve known broker template if confidence > 95%
- always review negative-value anomalies
- review when account mapping is missing

## 3.16 Security and Privacy Customization
Users should be able to choose:
- mask account numbers
- show/hide broker account codes
- show/hide balances in dashboard
- blur net worth by default
- hide sensitive documents from casual dashboard view

## 3.17 Document Source Customization
Users should be able to label uploaded sources:
- bank statement
- e-wallet export
- stock activity statement
- mutual fund confirmation
- dividend advice
- manual snapshot
- salary slip
- other

They should also be able to define custom source labels if desired.

## 3.18 Net Worth Logic Customization
Users should be able to decide whether net worth includes:
- regular bank cash
- investment cash
- stock holdings
- mutual funds
- bonds
- crypto
- receivables
- liabilities
- hidden accounts

This is important because “net worth” is often interpreted differently by different users.

## 3.19 Investment Performance Customization
Users should be able to define:
- whether to track only activity or also performance
- whether realized P/L appears in income analytics
- whether unrealized P/L appears in dashboard
- grouping by broker, account, category, or security

## 3.20 Custom Fields
Allow user-defined custom fields for:
- accounts
- brokers
- securities
- transactions
- trade activities
- documents

Examples:
- strategy label
- portfolio bucket
- family owner
- long-term vs trading
- source confidence note

This makes the system much more future-proof.

---

# 4. Detailed Customization Requirements by Domain

## 4.1 Investment Category Customization Requirements

### Functional Requirements
1. User can create custom investment categories.
2. User can edit default investment categories.
3. User can deactivate unused categories.
4. User can assign one or more securities/accounts/documents to a category.
5. User can define display order.
6. User can define whether a category is included in:
   - investments dashboard
   - net worth
   - cashflow
   - reports

### Example Default Categories
- Stocks
- Mutual Funds
- Bonds
- ETFs
- Gold
- Crypto
- Other Investments

### Suggested Data Fields
- id
- user_id
- name
- slug
- description
- icon_token
- color_token
- is_system_default
- is_active
- include_in_net_worth
- include_in_dashboard
- sort_order
- created_at
- updated_at

---

## 4.2 Securities/Broker Customization for Stock Category

### Functional Requirements
1. User can add a securities platform / broker.
2. User can choose the investment category it belongs to.
3. User can store broker code.
4. User can store client code.
5. User can store SID.
6. User can store SRE / RDN.
7. User can link uploaded stock activity documents to this broker.
8. User can mark a broker as default for stock documents matching certain metadata.
9. User can group holdings by broker.
10. User can filter activity by broker code.

### Example Broker Entities
- Ajaib
- Indo Premier
- Mirae Asset
- BNI Sekuritas
- Stockbit
- Mandiri Sekuritas
- Philip Sekuritas
- Custom broker

### Suggested Data Fields
- id
- user_id
- investment_category_id
- broker_name
- broker_code
- legal_entity_name
- branch_name
- client_code
- sid
- sre
- rdn_account_id
- default_currency
- country
- is_active
- notes
- created_at
- updated_at

### Important Stock Activity Requirement
Every stock activity record should be traceable to:
- investment category = Stocks
- selected broker/securities entity
- broker code
- linked cash account if available
- source document
- security/ticker

---

## 4.3 Investment Bank Balance Customization Requirements

### Functional Requirements
1. User can create investment bank balance accounts.
2. User can assign bank name.
3. User can link the account to one or more brokers/securities entities.
4. User can classify the account role as:
   - trading cash
   - settlement cash
   - dividend receiving account
   - linked RDN
   - temporary funding account
5. User can choose whether the balance is shown:
   - under cash
   - under investments
   - under both contexts with different reporting logic
6. User can map statement documents to the investment bank account.

### Suggested Data Fields
- id
- user_id
- account_name
- bank_name
- account_number_masked
- account_type = investment_cash_account
- investment_role
- linked_broker_id
- linked_investment_category_id
- include_in_total_cash
- include_in_investment_cash
- include_in_net_worth
- notes
- created_at
- updated_at

### Example Use Cases
- BCA RDN linked to Mirae Asset
- BRI RDN linked to Ajaib
- Mandiri investment funding account linked to Indo Premier

---

## 4.4 Regular Bank Balance Customization Requirements

### Functional Requirements
1. User can create regular bank accounts.
2. User can select bank name from presets or add a custom one.
3. User can assign account subtype:
   - savings
   - checking
   - payroll
   - digital bank
   - e-wallet
4. User can assign nickname and group.
5. User can choose whether it is included in:
   - total cash
   - daily spending analytics
   - emergency fund analytics
   - dashboard
6. User can map imported documents to that account.

### Suggested Bank Presets
- BCA
- BRI
- Mandiri
- BNI
- CIMB Niaga
- Jago
- SeaBank
- Permata
- OCBC
- Maybank
- Danamon
- GoPay
- OVO
- DANA
- ShopeePay
- Custom

### Suggested Data Fields
- id
- user_id
- institution_name
- bank_code
- account_nickname
- account_subtype
- account_group
- include_in_daily_cashflow
- include_in_total_cash
- include_in_net_worth
- is_active
- created_at
- updated_at

---

## 4.5 Combined vs Separate Expense/Income Tracking

### Core Requirement
Users must be able to choose how the system interprets and displays money flows across:
- regular bank balances
- investment bank balances

### Required Display Modes

#### Mode A — Combined Cashflow
All relevant cash movements are displayed in one unified income/expense timeline and dashboard.

Use case:
User wants a complete view of all incoming and outgoing money.

#### Mode B — Separate Cashflow
Regular banking cashflow and investment cashflow are shown separately.

Use case:
User wants to see living expenses separate from investment-related flows.

#### Mode C — Hybrid
Some investment cash events are included, others excluded based on rules.

Examples:
- include dividends as income
- exclude stock purchase funding from expense
- include broker admin fee as expense
- exclude top-up transfer to RDN from expense
- exclude stock sale proceeds from general income

### User Controls Required
- toggle default reporting mode
- configure event classification rules
- filter by account type
- filter by investment vs regular accounts
- save custom report views

### Reporting Rules Needed
For each transaction or activity, store flags such as:
- include_in_general_cashflow
- include_in_investment_cashflow
- include_in_income_reports
- include_in_expense_reports
- exclude_as_internal_transfer

---

# 5. Proposed Customization Data Model Extensions

## 5.1 New/Extended Entities

### investment_categories
- id
- user_id
- name
- slug
- icon_token
- color_token
- include_in_net_worth
- include_in_dashboard
- include_in_reports
- sort_order
- is_active

### brokers
- id
- user_id
- investment_category_id
- broker_name
- broker_code
- branch_name
- client_code
- sid
- sre
- rdn_account_id
- notes
- is_active

### account_groups
- id
- user_id
- name
- description
- purpose_type
- sort_order
- is_active

### account_display_preferences
- id
- user_id
- account_id
- include_in_total_cash
- include_in_net_worth
- include_in_daily_cashflow
- include_in_investment_cashflow
- include_in_dashboard
- hidden_by_default

### classification_rules
- id
- user_id
- rule_scope
- source_pattern
- target_type
- target_value
- confidence_override
- is_active
- priority

### report_preferences
- id
- user_id
- default_cashflow_mode
- include_dividends_in_income
- include_realized_pl_in_income
- include_broker_fees_in_expenses
- include_investment_cash_in_total_cash
- include_unrealized_pl_in_dashboard
- default_date_range

### custom_fields
- id
- user_id
- entity_type
- field_key
- field_label
- field_type
- allowed_values_json
- is_active

---

# 6. Customization UX / Settings Pages

## 6.1 Suggested Settings Navigation
- Profile
- Currency & Locale
- Account Customization
- Investment Categories
- Brokers & Securities
- Classification Rules
- Cashflow Preferences
- Report Preferences
- Dashboard Widgets
- Privacy & Masking
- Custom Fields

## 6.2 Investment Categories Settings Page
Should allow:
- create/edit/delete categories
- reorder categories
- assign colors/icons
- decide if included in net worth
- decide if included in dashboard

## 6.3 Brokers & Securities Settings Page
Should allow:
- add broker
- define broker code
- define client code/SID/SRE
- link to investment bank account
- set default mappings for imported stock activity docs

## 6.4 Account Customization Settings Page
Should allow:
- add/edit regular bank accounts
- add/edit investment bank accounts
- define nicknames
- define grouping
- define inclusion rules

## 6.5 Cashflow Preferences Page
Should allow:
- combined vs separate mode
- classification of investment inflows/outflows
- inclusion rules for dividends, realized gains, top-ups, transfers, fees, taxes

## 6.6 Classification Rules Page
Should allow:
- define rule conditions
- preview affected records
- set automatic mapping behavior
- prioritize rules
- enable/disable rules

---

# 7. Detailed Product Recommendations: What Else Should Be Added?

Below is a focused answer to your question about what else should be added to make the customization more suitable and appropriate.

## 7.1 Liabilities / Debt Tracking
To make the financial picture more complete, add customization for:
- credit cards
- personal loans
- mortgage
- BNPL
- margin debt if ever relevant

Why:
Net worth becomes more accurate when liabilities are included.

## 7.2 Goal Buckets / Purpose Labels
Allow accounts and investments to be tagged with goals:
- emergency fund
- retirement
- education
- house fund
- short-term trading
- long-term investing

Why:
This makes MoneyMate more personal and strategic, not only transactional.

## 7.3 Transfer Pair Matching
Add a customization workflow that pairs internal transfers between accounts.

Why:
This avoids false expense/income counting and makes regular bank ↔ investment bank movement cleaner.

## 7.4 Dividend / Fee / Tax Subclassification
Create dedicated subcategories and reporting toggles for:
- cash dividends
- stock dividends
- withholding tax
- broker fee
- levy
- stamp duty

Why:
Investment reporting becomes much more useful.

## 7.5 Per-Broker Performance Views
Allow users to separate portfolio performance by broker or securities platform.

Why:
If users have Ajaib and Mirae Asset at the same time, they may want separate analysis.

## 7.6 Auto-Mapping Memory
Let the system remember the user’s corrections and apply them to future imports.

Why:
This is one of the highest-value personalization features.

## 7.7 Manual Holdings Reconciliation
Allow users to manually confirm or correct holdings per broker.

Why:
Real documents are messy, and holdings may need one-time alignment.

## 7.8 Custom Dashboard Modes
Examples:
- Budget mode
- Net worth mode
- Investment-focused mode
- Minimal mode

Why:
Different users care about different parts of finance.

## 7.9 Source Reliability Labels
Allow records/documents to be tagged as:
- auto-imported
- OCR-extracted
- manually verified
- fully manual
- estimated

Why:
This improves user trust.

## 7.10 Multi-Portfolio or Bucket Support
Allow the user to define:
- main personal portfolio
- speculative trading portfolio
- retirement portfolio
- spouse-linked portfolio
- education portfolio

Why:
Very useful for advanced investors.

---

# 8. Super Detailed Build Prompts for Customization

Below are separate long-form prompts focused specifically on the customization system.

---

## Prompt A — Master Customization System Prompt

```md
Build an advanced customization system for a personal finance web application called **MoneyMate**.

### Product Context
MoneyMate is a document-driven and manually editable personal finance platform that tracks:
- expenses
- income
- regular bank balances
- investment bank balances
- stock activity
- investment holdings

The system already supports financial ingestion, review workflows, and dashboard reporting. Your task is to design and implement a highly flexible **customization layer** so users can adapt the product to their own financial structure and reporting preferences.

### Core Customization Requirements
Implement support for the following:

1. **Investment Categories**
   - Support customizable categories such as:
     - Stocks
     - Mutual Funds
     - ETFs
     - Bonds
     - Gold
     - Crypto
     - Other Investments
   - Allow user-defined categories
   - Allow category ordering, activation, icons, and inclusion flags for dashboard/net worth/reports

2. **Stock Category Broker/Securities Structure**
   - For the “Stocks” investment category, support broker/securities platforms such as:
     - Ajaib
     - Indo Premier
     - Mirae Asset
     - BNI Sekuritas
     - Mandiri Sekuritas
     - Philip Sekuritas
     - other custom entries
   - Store broker code
   - Store client code
   - Store SID
   - Store SRE / RDN
   - Link stock activity statements to broker entities
   - Support grouping stock activity by broker and by broker code

3. **Investment Bank Balance Customization**
   - Allow investment cash accounts with:
     - bank name
     - account nickname
     - role (RDN, settlement cash, trading cash, dividend account)
     - linked broker/securities entity
   - Allow inclusion/exclusion in:
     - total cash
     - investment cash
     - net worth
     - dashboard

4. **Regular Bank Balance Customization**
   - Support regular bank accounts with:
     - bank name (BCA, BRI, etc.)
     - account nickname
     - subtype (savings/checking/e-wallet/digital bank)
     - account group
   - Allow customizable display and reporting behavior

5. **Expense and Income View Logic**
   - Let users choose whether regular bank and investment bank cashflows are:
     - combined
     - separated
     - hybrid with rules
   - Allow rules for classifying:
     - dividends
     - stock sale proceeds
     - top-ups to broker cash
     - broker fees
     - taxes
     - internal transfers

### Additional Required Customizations
Also implement:
- account grouping
- report preferences
- dashboard widget preferences
- category mapping rules
- transfer detection rules
- custom fields
- privacy/masking preferences
- parser review thresholds
- document-to-account auto-mapping rules

### Deliverables
Generate:
1. domain architecture for customization
2. DB schema additions
3. Prisma models
4. backend services
5. settings pages
6. API endpoints
7. validation schemas
8. UI components
9. example user flows
10. example seed data
11. migration strategy for existing data
12. testing strategy

### Important Product Principle
The customization system must not be cosmetic only. It must actively influence:
- parsing defaults
- transaction classification
- dashboard aggregation
- report calculations
- investment grouping
- visibility rules
- review workflows

### Output Requirements
Return the implementation in this order:
1. customization architecture overview
2. schema changes
3. API design
4. backend service design
5. frontend settings UX
6. integration with transactions/investments/documents
7. example rule engine
8. test plan
```

---

## Prompt B — Customization Database and Rule Engine Prompt

```md
Design a database schema and rule engine for MoneyMate’s customization layer.

### Product Context
MoneyMate is a personal finance app with financial document ingestion, manual records, account tracking, investment tracking, and stock activity parsing.

The app needs a flexible customization layer that supports:
- investment categories
- broker entities with broker codes
- regular bank and investment bank account distinctions
- account grouping
- report preferences
- transaction classification rules
- document auto-mapping rules
- dashboard inclusion logic
- custom fields

### Requirements
Design schema and logic for:
1. investment_categories
2. brokers
3. linked investment bank accounts
4. account_groups
5. account_display_preferences
6. classification_rules
7. report_preferences
8. custom_fields
9. custom_field_values
10. dashboard_preferences
11. document_mapping_rules
12. parser_review_preferences

### Important Business Logic
The rule engine must support rules such as:
- if account type = investment_cash_account and description contains “Dividend”, include in general income
- if transfer is between regular bank and linked RDN, mark as internal transfer
- if broker code matches “YP”, map to broker “Mirae Asset”
- if statement contains “Ajaib”, assign broker Ajaib by default
- if activity type = Sell, do not include proceeds as general income unless user preference says so
- if fee type = broker fee, include in expenses only if preference enabled

### Deliverables
Produce:
- Prisma schema models
- enums
- unique/index constraints
- relation map
- rule evaluation strategy
- priority handling
- conflict resolution logic
- auditability approach
- performance considerations
- sample queries
```

---

## Prompt C — Settings UI / UX Prompt for Customization

```md
Design and build the settings and customization UI for MoneyMate.

### Goal
Create a premium, highly usable settings area where users can customize how MoneyMate models and reports their financial world.

### Required Settings Areas
1. Investment Categories
2. Brokers & Securities
3. Regular Bank Accounts
4. Investment Cash Accounts
5. Cashflow Preferences
6. Category Rules
7. Transfer Rules
8. Report Preferences
9. Dashboard Widgets
10. Privacy and Balance Masking
11. Custom Fields
12. Import / Document Mapping Defaults

### UX Requirements
- Make settings powerful but understandable
- Avoid overwhelming the user
- Use progressive disclosure
- Show examples/previews of how rules affect reporting
- Support editing existing defaults
- Use inline explanations for complex financial settings

### Key UX Behaviors
- Users can add category rows dynamically
- Users can create brokers with broker code and linked RDN account
- Users can choose combined/separate cashflow mode from a guided flow
- Users can preview whether dividends, fees, and transfers appear in reports
- Users can create classification rules with condition builder UI
- Users can set dashboard widget visibility
- Users can define custom fields for accounts, brokers, securities, and transactions

### Required Components
- settings sidebar
- editable list tables
- form dialogs
- rule builder
- mapping preview panel
- impact summary card
- toggle groups
- drag-and-drop ordering UI
- visibility chips
- masking toggle
- linked account selector

### Deliverables
Provide:
- page structure
- component tree
- state management approach
- form schemas
- sample mock data
- responsive behavior
- accessibility considerations
```

---

## Prompt D — Reporting and Aggregation Customization Prompt

```md
Build the reporting customization layer for MoneyMate.

### Context
MoneyMate tracks:
- expenses
- income
- regular bank balances
- investment bank balances
- stock activity
- holdings

Users need control over how reporting aggregates these records.

### Required Reporting Customizations
1. Combined vs separate regular/investment cashflow
2. Inclusion or exclusion of:
   - dividends
   - stock sale proceeds
   - broker fees
   - taxes
   - internal transfers
   - realized gains
   - unrealized gains
3. Net worth inclusion rules
4. Account-group-based reporting
5. Broker-based investment reporting
6. Investment-category-based reporting
7. Saved report presets

### Required Functional Behavior
- Reporting should respect user preferences everywhere
- Dashboard cards and charts must reflect the selected logic
- User should be able to switch modes temporarily in reports
- Default reporting mode should come from saved preferences
- Every report should be transparent about what is included/excluded

### Deliverables
Generate:
- aggregation rules
- preference schema
- query strategy
- API contracts
- frontend filters
- saved preset model
- examples of combined and separated financial summaries
```

---

## Prompt E — Parsing Personalization and Auto-Mapping Prompt

```md
Build personalization and auto-mapping features for MoneyMate’s document ingestion system.

### Goal
Use user-defined customization settings to make document ingestion smarter over time.

### Requirements
The ingestion system must support:
- broker auto-detection from stock activity statements
- account auto-mapping from statement metadata
- reusable classification rules from past corrections
- personalized parser review thresholds
- custom row classification defaults
- remembered mappings for known document patterns

### Example Behaviors
- Documents mentioning “Mirae Asset” map to broker Mirae Asset
- Documents containing broker code “YP” map to one specific broker profile
- Rows containing “Distribusi E-IPO” classify as corporate distribution
- Dividend rows in an investment cash account map to income category “Dividend”
- Transfer from BCA to linked RDN is recognized as internal transfer

### Deliverables
Provide:
- architecture for ingestion personalization
- mapping rules model
- correction memory model
- confidence override strategy
- review threshold logic
- test scenarios
- conflict handling rules
- fallback behavior
```

---

# 9. Implementation Recommendations

## 9.1 What Should Be Prioritized First
If customization is developed in phases, prioritize in this order:

### Phase 1
- investment categories
- broker/securities entities with broker code
- regular bank accounts with bank name presets
- investment bank accounts linked to brokers
- combined vs separate cashflow preference

### Phase 2
- classification rules
- transfer rules
- report preferences
- dashboard widget preferences
- auto-mapping rules

### Phase 3
- custom fields
- masking/privacy controls
- saved report presets
- parser review preferences
- multi-portfolio support

## 9.2 Best Product Decision
The best approach is to make customization influence the core data interpretation layer, not just labels in the UI.

That means user preferences should affect:
- parsing outcomes
- classification outcomes
- report inclusion rules
- dashboard totals
- review queue suggestions
- account grouping
- stock activity grouping

---

# 10. Final Recommendation Summary

To make MoneyMate more suitable and appropriate for customization, I strongly recommend adding these beyond your original list:

1. **Account grouping**
2. **Classification rules**
3. **Transfer detection**
4. **Dividend / fee / tax handling**
5. **Per-broker analysis**
6. **Auto-mapping memory**
7. **Manual reconciliation**
8. **Dashboard/report preferences**
9. **Goal labels / purpose buckets**
10. **Net worth inclusion rules**
11. **Custom fields**
12. **Privacy/masking options**
13. **Multi-portfolio support**
14. **Liability tracking in the future**

These additions would make the app much more realistic, especially for someone managing both banking and investing flows.

---

# 11. Closing Product Direction

The best version of MoneyMate is not only a finance dashboard. It is a **customizable financial operating system** for personal money, balances, documents, and investment activity.

That means the app should let users define:
- what each account is,
- how each movement is interpreted,
- how investment cash is linked,
- how broker activity is grouped,
- and how reports should present their financial reality.

This customization addendum should be used as the next layer of product and engineering planning after the base PRD.
