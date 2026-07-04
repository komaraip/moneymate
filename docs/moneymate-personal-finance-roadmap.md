Continue from the current MoneyMate repository state.

The app is currently demo-ready for the local MVP scope, but the product direction is changing and I approve moving into the next planning phase.

New product direction:
MoneyMate should become a multi-user personal finance web app for many individual users, not just a local personal portfolio demo. It should help users manage income, expenses, cashflow, budgets, savings goals, accounts/wallets, reports, and personal net worth.

Important product decisions:

1. Roles must be simplified to only:

   * `admin`
   * `user`
2. Remove/deprecate:

   * `owner`
   * `viewer`
3. Add theme switching:

   * light
   * dark
   * system
4. MoneyMate must support expense and income tracking, not only asset/portfolio viewing.
5. The product is for personal finance, not company finance.
6. Because the app will have many pages, navigation and routing must be reorganized cleanly.
7. Do not implement everything immediately. First audit and create a detailed implementation plan.

Decision-making instruction:
If you encounter questions, ambiguity, or multiple valid implementation options, do not stop to ask me unless the decision is destructive, security-sensitive, or could cause major irreversible architecture changes.

For normal product, UI, code structure, naming, route, folder, validation, or implementation choices, choose the best option based on your recommendation and clearly document the assumption.

If a reasonable decision is needed to complete the audit and plan, make the recommendation yourself, state the assumption clearly, and continue without asking me.

Default preferences:

* Prioritize scalable and maintainable architecture.
* Prioritize privacy-safe behavior.
* Prioritize personal finance use cases over company finance use cases.
* Prioritize demo-ready implementation before advanced production hardening.
* Prefer simple, reliable solutions over over-engineered ones.
* Prefer grouped navigation and grouped feature modules over flat structures.
* Prefer non-destructive migrations and backwards-compatible changes where possible.
* If old behavior conflicts with the new product direction, prefer the new product direction.
* If a feature is too large for the current phase, document it as P1/P2 instead of blocking progress.

Only stop and ask for approval if:

* A command may delete or overwrite real user data.
* A migration may permanently remove data.
* A security/privacy decision is unclear and high impact.
* A production deployment or secret-management decision is required.
* The repository is in a conflicted or unsafe Git state.

Important navigation and routing direction:

1. Sidebar navigation must be grouped by section, but not implemented as dropdowns.
2. Each group should show its title and its child navigation links directly.
3. Avoid nested dropdown navigation in the sidebar because this app should stay fast and easy to scan.
4. Use clear sidebar groups such as:

   * Overview
   * Money Management
   * Planning
   * Reports
   * Assets & Net Worth
   * Admin
   * Settings
5. The sidebar must support many pages without becoming messy.
6. Active route state must be clear.
7. Navigation labels must be user-friendly and personal-finance oriented.
8. Mobile navigation should remain usable and should not become a complicated dropdown tree.
9. Frontend route folders must also be grouped by domain/feature, not dumped flat into one routes/pages folder.
10. Backend routes/handlers/services/repositories must also be grouped by domain/feature where appropriate.

Your task in this turn:
Create a complete audit and implementation plan only. Do not execute code changes yet.

Audit the current repository and answer:

## Product, Role, and Auth Audit

1. Where are roles currently defined?
2. Where are `owner` and `viewer` used?
3. What backend changes are needed to support only `admin` and `user`?
4. What frontend changes are needed to support only `admin` and `user`?
5. How is auth/session/route protection currently implemented?
6. What tests currently cover roles and route protection?
7. What seed data currently depends on old roles?

## Multi-user Data Isolation Audit

1. Is all user-owned financial data properly scoped by user?
2. Which tables/models/entities need `user_id` ownership?
3. Which API endpoints must enforce ownership?
4. Which queries could accidentally expose another user’s data?
5. Should admins be able to view user financial data?
6. Prefer privacy-safe admin behavior by default: admin can manage accounts/users, but should not read private transactions unless explicitly designed.

## Personal Finance Feature Audit

1. What transaction model currently exists?
2. What is missing for income tracking?
3. What is missing for expense tracking?
4. What is missing for transfer tracking?
5. What category/account/wallet functionality exists?
6. What is missing for budgeting?
7. What is missing for savings goals?
8. What is missing for bills/subscriptions/recurring transactions?
9. What is missing for personal financial reports?
10. Which current portfolio-focused features should be retained, simplified, renamed, or moved to later phases?

## Dashboard Audit

1. How should the dashboard change from portfolio-focused to personal-finance-focused?
2. What widgets should be added?
3. What widgets should be removed or deprioritized?
4. How should income, expense, cashflow, budget, savings, and net worth be represented?

## Theme Audit

1. How is theme currently implemented?
2. Is dark mode hardcoded anywhere?
3. Which components need light theme fixes?
4. What is needed for light/dark/system theme support?
5. Where should theme preference be persisted?
6. Should theme be stored in local storage, user profile, or both?

## Navigation, Route, and Folder Structure Audit

1. How is the current sidebar/navbar implemented?
2. Which pages/routes currently exist?
3. Which routes are unfinished, placeholder, or portfolio-focused?
4. How should the future sidebar be grouped?
5. How should frontend route folders be grouped by feature/domain?
6. How should backend API routes be grouped by feature/domain?
7. Which backend handlers/services/repositories should be reorganized?
8. How should shared types, schemas, validators, and utilities be organized?
9. How should admin routes be separated from user routes?
10. How should route guards and layout guards be structured?

Required implementation plan phases:

## Phase 1 — Product Scope Reset

Objective:

* Update product positioning to multi-user personal finance.
* Define personal finance MVP scope.
* Define what remains out of scope.
* Create/update roadmap documentation.

Include:

* Files likely affected
* Documentation changes
* Feature scope decisions
* Risks
* Validation
* Definition of done

## Phase 2 — Navigation, Route, and Folder Architecture

Objective:

* Prepare the app structure for many pages without messy routing or navigation.

Frontend requirements:

* Sidebar must use grouped navigation sections, not dropdowns.
* Sidebar groups should be visible and scannable.
* Suggested groups:

  * Overview
  * Money Management
  * Planning
  * Reports
  * Assets & Net Worth
  * Admin
  * Settings
* Group route folders by domain/feature.
* Avoid dumping all pages into a flat folder.
* Keep layouts clean and reusable.
* Ensure active route state works.
* Ensure mobile navigation remains usable.

Backend requirements:

* Group API routes by domain/feature.
* Keep handlers/controllers, services, repositories, DTOs/schemas, and validators organized.
* Separate admin-facing APIs from user-facing APIs.
* Ensure route naming is consistent and scalable.
* Avoid one giant route/handler file.

Suggested frontend grouping:

* `overview`
* `transactions`
* `accounts`
* `categories`
* `budgets`
* `goals`
* `reports`
* `net-worth`
* `assets`
* `imports`
* `settings`
* `admin`

Suggested backend grouping:

* `auth`
* `users`
* `transactions`
* `accounts`
* `categories`
* `budgets`
* `goals`
* `reports`
* `assets`
* `imports`
* `admin`
* `backup` or `operations` if applicable

Include:

* Proposed route map
* Proposed sidebar group map
* Proposed frontend folder structure
* Proposed backend folder structure
* Migration strategy from current structure
* Risks
* Validation
* Definition of done

## Phase 3 — Role Simplification

Objective:

* Replace roles with only `admin` and `user`.
* Remove `owner` and `viewer`.

Tasks:

* Update backend role definitions.
* Update database/seed data.
* Update frontend route/access logic.
* Update tests.
* Update docs.
* Validate auth and role behavior.

Define:

* Admin capabilities
* User capabilities
* What admins cannot do by default for privacy safety

## Phase 4 — Data Isolation & Multi-user Safety

Objective:

* Ensure every user-owned financial entity is scoped by `user_id`.

Tasks:

* Audit all user-owned entities.
* Add missing ownership fields if needed.
* Update API queries.
* Update repositories/services.
* Add tests proving User A cannot access User B data.
* Decide safe admin boundaries.

## Phase 5 — Theme System

Objective:

* Add light/dark/system theme support.

Tasks:

* Add theme provider if missing.
* Add theme toggle.
* Persist preference.
* Fix hardcoded dark styles.
* Validate forms, tables, charts, cards, modals, dropdowns, sidebar, navbar, and mobile layout in light and dark themes.

## Phase 6 — Personal Finance Transaction Core

Objective:

* Make MoneyMate support real income, expense, and transfer tracking.

Tasks:

* Define transaction types:

  * `income`
  * `expense`
  * `transfer`
* Add or improve create/edit/delete flows.
* Add category support for income and expense.
* Add account/wallet selection.
* Ensure transfers do not count as income or expense.
* Update dashboard and reports accordingly.

## Phase 7 — Expense & Income Tracker UX

Objective:

* Make daily transaction tracking easy.

Tasks:

* Add quick add transaction.
* Improve transaction filters:

  * date range
  * type
  * category
  * account
  * search
* Add validation.
* Add toast feedback.
* Add useful empty states.
* Improve mobile usability.

## Phase 8 — Budgeting MVP

Objective:

* Add useful monthly budgeting.

Tasks:

* Monthly budget per category.
* Budget progress.
* Overbudget warning.
* Dashboard budget widget.
* Monthly budget report.

## Phase 9 — Savings Goals MVP

Objective:

* Add personal savings planning.

Tasks:

* Savings goal CRUD.
* Target amount.
* Deadline.
* Progress tracking.
* Dashboard widget.

## Phase 10 — Reports & Insights

Objective:

* Improve personal finance reporting.

Tasks:

* Monthly summary.
* Income vs expense report.
* Category breakdown.
* Cashflow trend.
* Export alignment.
* Keep reports personal finance oriented.

## Phase 11 — Admin Platform

Objective:

* Support many users safely.

Tasks:

* Admin dashboard.
* User list/search.
* Activate/deactivate users.
* Change role between `admin` and `user`.
* Admin should not view private user financial transactions by default unless explicitly designed and documented.

## Phase 12 — Testing & Validation

Objective:

* Ensure the new direction is stable.

Tasks:

* Update unit tests.
* Update integration tests.
* Update Playwright smoke tests.
* Update component tests.
* Validate Docker flow.
* Validate backup flow still works.
* Validate theme switching.
* Validate role behavior.
* Validate user data isolation.
* Validate route guards.
* Validate grouped navigation.

For every phase, include:

* Objective
* Files likely affected
* Backend tasks
* Frontend tasks
* Database/migration tasks
* Test tasks
* Documentation tasks
* Risks
* Validation commands
* Definition of done
* Recommended commit message

Also create a prioritized feature backlog with:

## P0 — Required for new multi-user personal finance direction

Must include:

* Role simplification to `admin` and `user`
* Remove `owner` and `viewer`
* User data isolation
* Grouped sidebar navigation
* Grouped frontend routes/folders
* Grouped backend routes/modules
* Theme switch light/dark/system
* Income tracker
* Expense tracker
* Transfer tracking
* Category management
* Account/wallet management
* Personal finance dashboard

## P1 — Important after P0

Include:

* Budgeting
* Savings goals
* Recurring transactions
* Bill reminders
* Subscription tracker
* Monthly reports
* CSV import mapping
* Auto-categorization rules
* Admin user management
* Improved mobile UX

## P2 — Future enhancement

Include:

* Debt payoff planner
* Emergency fund tracker
* Forecasting
* What-if simulation
* PWA
* PDF/Excel export
* Advanced investment analytics
* Notification center
* User data export/delete
* Financial health score

Do not change files yet.
Do not commit.
Do not remove roles yet.
Do not modify database yet.
Only audit and produce the plan.

Output in Indonesian, detailed, technical, and actionable.
