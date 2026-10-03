# Mobilex Security Baseline

## Frontend

Only public Supabase configuration belongs in `VITE_*`. Never expose service-role keys, payment secrets, webhook secrets, private keys, or database credentials to the browser.

## Database

All customer-owned records must be protected with Row Level Security. Staff actions that mutate inventory, roles, orders, content, or audit records must pass server-side authorization.

## Checkout

The browser is not authoritative for price, discount, stock, shipping cost, or payable total. The server-side commerce functions must recalculate and validate sensitive values.

## External links

External anchors are hardened with `noopener noreferrer` where appropriate.

## Reporting

Do not publish secrets in issues, logs, screenshots, or support tickets. Rotate any secret that may have been exposed.
