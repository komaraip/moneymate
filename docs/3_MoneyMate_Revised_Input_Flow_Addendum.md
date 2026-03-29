# MoneyMate — Revised Input Flow and Data Structure Addendum

## Purpose

This is a separate addendum document that revises the previous customization logic to match a simpler, neater, and more structured user flow.

This version reflects these important product decisions:

1. The user should choose **manual input** or **automatic input (document upload)** before entering data.
2. If the user chooses **upload**, there is no need to manually select **expense** or **income** first, because those can be extracted from the uploaded document.
3. The system should be structured around **Assets**, then the relevant account hierarchy.
4. The terms should be simplified:
   - **Regular Bank Balance** becomes **Savings Balance**
   - **Investment Bank Balance** becomes **Investment Balance**
5. Savings accounts and investment accounts must be clearly separated because:
   - savings accounts are standard bank accounts
   - investment accounts are usually **RDN (Customer Fund Account)**
6. **Account Number is essential** because a single bank can contain:
   - multiple savings accounts
   - multiple RDN accounts
   - accounts with similar names
   - accounts with similar or identical account types

This document defines the revised product structure, data model direction, CRUD structure, and detailed build prompts for this updated flow.

---

# 1. Core Product Revision

## 1.1 Revised Entry Logic

The old idea of selecting categories too early is not the best fit for all flows.

The revised logic should be:

### Step 1
Choose the high-level **asset structure**

### Step 2
Choose the specific account path

### Step 3
Choose **Manual** or **Upload**

### Step 4
Input or process:
- activity transaction
- account balance

This is cleaner because:
- upload flows can infer transaction type from documents
- manual flows can open the correct form after the account path is known
- data is organized by financial structure first, not by isolated transaction label first

---

# 2. Required Terminology Changes

To make the app easier for users to understand, use these terms:

## Replace:
- Regular Bank Balance → **Savings Balance**
- Investment Bank Balance → **Investment Balance**

## Reason
These names are clearer and closer to how users mentally organize their money:
- **Savings Balance** = money in normal bank savings-type accounts
- **Investment Balance** = money in investment-related funding accounts such as RDN

This terminology should be reflected in:
- UI labels
- settings
- forms
- reports
- dashboards
- API response labels where appropriate
- documentation

---

# 3. Revised Main Input Flow

## 3.1 Top-Level Structure

The input flow should begin with the user choosing the broad asset path first.

### Main Paths
- **Assets**
  - **Investment**
  - **Savings**

This keeps the system neat and easy to understand.

---

# 4. Revised Structured Flow for Investment Assets

## 4.1 Investment Flow

### Desired Structure
**Assets → Investment (asset type) → Investment Category → Securities and Broker Code (if Stocks selected) → Bank → Account Type automatically → Account Number → Manual / Upload selection → Activity Transaction and Account Balance**

## 4.2 Step-by-Step Investment Flow

### Step 1 — Asset Type
User selects:
- Assets

### Step 2 — Asset Subtype
User selects:
- Investment

### Step 3 — Investment Category
User selects investment category such as:
- Stocks
- Mutual Funds
- Bonds
- ETFs
- Gold
- Crypto
- Other Investments

### Step 4 — Securities and Broker Code
If the selected investment category is **Stocks**, show:
- Securities / broker name
- Broker code

Examples:
- Ajaib
- Indo Premier
- Mirae Asset
- Mandiri Sekuritas
- BNI Sekuritas
- Custom broker

This step is important for stock activity.

### Step 5 — Bank
User selects the linked bank.

Examples:
- BCA
- BRI
- Mandiri
- BNI
- CIMB
- Jago
- etc.

### Step 6 — Account Type Automatically
The system should automatically set the account type based on the path.

For Investment:
- Account Type = **RDN / Customer Fund Account**

User should not have to choose this manually in the main flow unless advanced editing is needed.

### Step 7 — Account Number
User selects or enters the exact account number.

This is essential because:
- one bank can have multiple RDN accounts
- one broker can be linked to more than one bank account
- account numbers prevent confusion

### Step 8 — Manual or Upload
User chooses:
- Manual
- Upload

### Step 9 — Activity Transaction and Account Balance
After that, system opens the appropriate input/output view for:
- transaction activity
- account balance

For example:
- stock activity transactions
- dividends
- investment cash movements
- account balance snapshots
- holdings-related linked records where relevant

---

# 5. Revised Structured Flow for Savings Assets

## 5.1 Savings Flow

### Desired Structure
**Assets → Savings (asset type) → Bank → Account Type automatically → Account Number → Manual / Upload selection → Activity Transaction and Account Balance**

## 5.2 Step-by-Step Savings Flow

### Step 1 — Asset Type
User selects:
- Assets

### Step 2 — Asset Subtype
User selects:
- Savings

### Step 3 — Bank
User selects bank name.

Examples:
- BCA
- BRI
- Mandiri
- BNI
- Jago
- SeaBank
- GoPay
- OVO
- DANA
- Custom

### Step 4 — Account Type Automatically
The system should automatically set:
- Account Type = **Savings Account**

This avoids unnecessary friction.

### Step 5 — Account Number
User selects or enters the exact account number.

This is essential because:
- one bank can have multiple savings accounts
- multiple accounts can exist under the same bank
- some users may have several accounts for salary, spending, emergency fund, etc.

### Step 6 — Manual or Upload
User selects:
- Manual
- Upload

### Step 7 — Activity Transaction and Account Balance
System then shows the proper view for:
- savings transactions
- expense/income movements
- transfer activity
- savings balance snapshots

---

# 6. Revised CRUD Data Structure

You specified that there is CRUD data with this simplified structure:

**Bank → Account Type → Account Number → Activity Transaction and Account Balance**

This is correct and should be implemented as a foundational CRUD pattern.

## 6.1 Core CRUD Entity Structure
Each financial account record should be built around:

- Bank
- Account Type
- Account Number
- Activity Transactions
- Account Balances

## 6.2 Why This Structure Works
This structure is simple and scalable because:
- bank defines institution
- account type defines financial behavior
- account number defines the exact account identity
- activity transactions represent movement history
- account balance represents stored value or snapshots

## 6.3 CRUD Requirements
Users should be able to:

### Create
- bank accounts
- investment accounts
- account numbers
- linked transactions
- linked balances

### Read
- all accounts by bank
- all accounts by type
- all accounts by account number
- all transactions for one account
- all balances for one account

### Update
- bank/account metadata
- account nickname
- linked broker
- activity records
- balances
- account mapping rules

### Delete / Archive
- deactivate old accounts
- archive unused accounts
- preserve audit trail even if account is hidden

---

# 7. Important Account Logic

## 7.1 Savings and Investment Accounts Are Different

The system must clearly separate:

### Savings Accounts
These are normal bank accounts used for:
- storing money
- daily transactions
- salary receipts
- transfers
- regular expenses/income

### Investment Accounts
These are accounts used for:
- funding investments
- receiving settlement flows
- broker-linked transactions
- stock-related cash activity

In many cases, these are **RDN accounts**.

## 7.2 Why This Matters
Even if the same bank is used, the accounts are not the same.

Example:
- BCA Savings Account for daily spending
- BCA RDN Account linked to Mirae Asset for trading cash

Without clear distinction, the user may confuse:
- balance meaning
- transaction type
- source of funds
- reporting logic

## 7.3 Required System Distinction
The system should always distinguish:
- Savings Account
- RDN / Investment Account

This distinction should affect:
- labels
- reporting
- parser mapping
- cashflow logic
- dashboard grouping
- transfer detection

---

# 8. Why Account Number Must Be Required

## 8.1 Account Number is a Primary Differentiator
Within one bank, there can be:
- multiple savings accounts
- multiple RDN accounts
- similar account nicknames
- similar account roles

Therefore, **account number is essential**.

## 8.2 Product Rule
The system should not rely on:
- bank name only
- account type only
- nickname only

It must rely on:
- bank
- account type
- account number

## 8.3 Suggested Validation Rule
Each account record should require:
- bank
- account_type
- account_number

Optional:
- nickname
- linked broker
- purpose label
- notes

## 8.4 Uniqueness Rule
At minimum, enforce uniqueness on:
- user_id + bank_id + account_type + account_number

This avoids confusion between accounts.

---

# 9. Revised Display Logic

## 9.1 Savings Balance
Show balances under:
- Savings
- Savings Balance
- Savings Transactions
- Savings Accounts

## 9.2 Investment Balance
Show balances under:
- Investment
- Investment Balance
- Investment Cash
- RDN Accounts
- Investment Transactions

## 9.3 Reporting Logic
Users can still choose:
- combined view
- separate view

But the default labels should be clearer:
- **Savings Cashflow**
- **Investment Cashflow**

instead of:
- regular bank cashflow
- investment bank cashflow

---

# 10. Revised Input UX

## 10.1 Best Main UX Flow
The cleanest top-level entry options should be:

### Option A — Add / Manage Savings
Path:
**Assets → Savings → Bank → Account Type auto = Savings Account → Account Number → Manual/Upload → Activity Transaction and Account Balance**

### Option B — Add / Manage Investment
Path:
**Assets → Investment → Investment Category → Securities/Broker Code if needed → Bank → Account Type auto = RDN → Account Number → Manual/Upload → Activity Transaction and Account Balance**

This is much cleaner than asking for expense/income first.

## 10.2 Why Manual/Upload Should Come Later
Manual or upload should be selected after the account path is known because:
- the system first needs to know where data belongs
- then it can show the correct form or parser
- this reduces wrong routing
- this keeps the interface more structured

---

# 11. What Happens After Manual or Upload

## 11.1 If Manual is Selected
Show a form tailored to the chosen path.

### Savings Manual Forms
Could include:
- income transaction
- expense transaction
- transfer
- balance snapshot

### Investment Manual Forms
Could include:
- cash in/out
- dividend
- investment fee
- stock transaction reference
- investment balance snapshot

## 11.2 If Upload is Selected
Open document upload flow tied to the selected account path.

### Savings Upload
Examples:
- bank statements
- e-wallet exports
- account statements

### Investment Upload
Examples:
- stock activity statements
- RDN statements
- broker cash statements
- dividend statements

The parser should use the chosen path as a strong routing hint.

---

# 12. Revised Data Model Direction

## 12.1 Core Account Model
Suggested fields:
- id
- user_id
- asset_group
- asset_subtype
- investment_category_id (nullable for savings)
- bank_id
- account_type
- account_number
- account_nickname
- linked_broker_id (nullable)
- is_active
- created_at
- updated_at

## 12.2 Account Type Enum
Use clear values:
- SAVINGS_ACCOUNT
- RDN_ACCOUNT

Optional future values:
- EWALLET_ACCOUNT
- CASH_ACCOUNT
- CREDIT_ACCOUNT

## 12.3 Asset Subtype Enum
- SAVINGS
- INVESTMENT

## 12.4 Balance Terminology
Use:
- savings_balance
- investment_balance

instead of:
- regular_bank_balance
- investment_bank_balance

## 12.5 Transaction Linkage
Transactions should always link to:
- account_id
- bank
- account_type
- account_number
- asset subtype

This keeps records structured and auditable.

---

# 13. Revised Dashboard and Reporting Structure

## 13.1 Dashboard Groups
Main sections should become:

### Savings
- total savings balance
- savings inflow
- savings outflow
- recent savings transactions

### Investments
- total investment balance
- investment cash movement
- stock activity
- holdings
- broker-linked accounts

## 13.2 Combined View Option
Allow a summary card:
- total liquid assets = savings balance + investment balance

This is useful if the user wants one top-line figure.

## 13.3 Separate View Option
Default structure should remain separated because it is cleaner:
- Savings Balance
- Investment Balance

---

# 14. Revised Settings and Master Data Structure

## 14.1 Bank Master Data
Fields:
- bank_name
- bank_code
- institution_type
- is_active

## 14.2 Account Master Data
Fields:
- bank
- account_type
- account_number
- nickname
- linked_asset_subtype

## 14.3 Broker Master Data
Fields:
- broker_name
- broker_code
- investment_category
- linked_bank_account
- linked_account_number

## 14.4 Relationship Logic
Examples:
- Mirae Asset → linked to BCA RDN account number xxxx
- Ajaib → linked to BRI RDN account number yyyy
- BCA Savings Account number zzzz → not linked to broker unless used as transfer source

---

# 15. Product Recommendation Summary

Your revised flow is stronger because it is:

- simpler
- more structured
- easier to understand
- more aligned with real finance behavior
- less confusing for uploads
- better for CRUD design
- better for account identity management

The most important improvements are:

1. choose the asset path first
2. choose account identity before input method
3. put manual/upload after account context is known
4. distinguish savings and investment clearly
5. require account number as a core identifier
6. rename balances to Savings Balance and Investment Balance

---

# 16. Super Detailed Build Prompt for the Revised Flow

```md
Revise the MoneyMate product architecture and UI flow to use a cleaner account-first structure.

### Core Revision
The system should no longer ask users to select expense or income too early.

Instead, the flow must be:

For savings:
Assets → Savings → Bank → Account Type auto = Savings Account → Account Number → Manual or Upload → Activity Transaction and Account Balance

For investments:
Assets → Investment → Investment Category → Securities/Broker Code if stock selected → Bank → Account Type auto = RDN Account → Account Number → Manual or Upload → Activity Transaction and Account Balance

### Required Terminology Changes
Replace:
- Regular Bank Balance with Savings Balance
- Investment Bank Balance with Investment Balance

### Account Rules
- Savings accounts and investment accounts are different
- Investment accounts are typically RDN accounts
- Savings accounts are standard savings accounts
- The same bank can have multiple accounts with different or identical types
- Account number is essential and must be treated as a core identifier

### CRUD Structure
Design account CRUD around:
- Bank
- Account Type
- Account Number
- Activity Transaction
- Account Balance

### Functional Requirements
1. User can create savings accounts
2. User can create investment/RDN accounts
3. User can link broker to investment account
4. User can upload documents after selecting the proper account path
5. User can manually enter transactions after selecting the proper account path
6. Upload flow should use selected account path as parser routing hint
7. Dashboard should show Savings Balance and Investment Balance separately by default
8. Reports may combine them if user preference enables combined liquid assets view

### UX Requirements
- keep flow simple
- use progressive disclosure
- auto-fill account type based on selected path
- require account number before saving
- reduce unnecessary choices
- only show broker fields when relevant
- only show investment category when investment path selected

### Data Model Requirements
Include fields for:
- asset_group
- asset_subtype
- investment_category_id
- bank_id
- account_type
- account_number
- linked_broker_id

### Output Requirements
Provide:
1. revised IA
2. updated schema
3. page flow diagrams in text
4. form logic
5. CRUD API structure
6. parser routing logic
7. dashboard/report logic
8. validation rules
9. edge cases
10. migration notes from old terminology
```

---

# 17. Final Product Direction

The revised model should treat the system primarily as an **account-structured financial platform**, not just a loose category-driven finance tracker.

That means:
- account identity comes first
- input method comes after account context
- savings and investment must be clearly separated
- account number is mandatory for correctness
- uploaded documents should be routed based on selected account structure
- balances should use user-friendly language

This is the cleaner and more correct direction for MoneyMate.
