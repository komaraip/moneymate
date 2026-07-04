# Realized P/L Methodology Note

MoneyMate MVP does not implement realized profit/loss yet.

Current portfolio reports use backend holdings snapshots for unrealized P/L and simple portfolio value changes only. They do not claim FIFO, tax-lot accounting, time-weighted return, money-weighted return, or tax reporting.

Possible future realized P/L methods:

- Weighted-average realized P/L: simpler for beginner portfolio tracking, but needs a clear rule for partial sells and fees/tax allocation.
- FIFO tax-lot realized P/L: closer to lot-based tax workflows, but more complex and requires explicit product decisions around lots, fees, tax, and corrections.

Do not implement either method until the product decision is explicit. The app should stay beginner-safe, avoid buy/sell recommendations, and clearly label manual/mock price data as not real-time.
