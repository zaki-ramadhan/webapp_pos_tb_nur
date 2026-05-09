# Domain Entities and Relations

Dokumen ini merangkum entitas inti dan relasi utama yang saat ini dijadikan acuan domain proyek POS toko bangunan.

## Identity and Access

### `users`

- id
- name
- email
- phone
- password
- is_active
- last_login_at

### `roles`

- id
- code
- name

### `user_role`

- user_id
- role_id

## Organization

### `branches`

- id
- code
- name
- address
- phone
- is_active

### `warehouses`

- id
- branch_id
- code
- name
- type: `main|display|buffer|damaged`
- is_active

## Product Catalog

### `product_categories`

- id
- parent_id nullable
- code
- name
- slug
- is_active

### `brands`

- id
- code
- name
- is_active

### `units`

- id
- code
- name
- precision

### `products`

- id
- category_id
- brand_id nullable
- sku
- barcode nullable
- name
- slug
- product_type: `stock|service|non_stock`
- base_unit_id
- purchase_unit_id nullable
- sales_unit_id nullable
- track_stock boolean
- minimum_stock
- default_purchase_price
- default_sale_price
- is_active
- notes nullable

### `product_unit_conversions`

- id
- product_id
- from_unit_id
- to_unit_id
- multiplier

### `product_barcodes`

- id
- product_id
- unit_id
- barcode
- is_primary

### `price_tiers`

- id
- code
- name
- description nullable

### `product_prices`

- id
- product_id
- price_tier_id
- unit_id
- price
- effective_from

## Business Partners

### `suppliers`

- id
- code
- name
- phone
- email nullable
- tax_number nullable
- address
- payment_term_days
- credit_limit nullable
- is_active

### `customers`

- id
- code
- name
- phone
- email nullable
- tax_number nullable
- address
- customer_type: `retail|contractor|project|walk_in`
- default_price_tier_id nullable
- payment_term_days
- credit_limit nullable
- is_active

## Purchasing

### `purchase_orders`

- id
- number
- supplier_id
- branch_id
- warehouse_id
- order_date
- expected_date nullable
- status: `draft|submitted|approved|partial|completed|cancelled`
- subtotal
- discount_total
- tax_total
- grand_total
- notes nullable
- created_by
- approved_by nullable

### `purchase_order_items`

- id
- purchase_order_id
- product_id
- unit_id
- quantity
- unit_price
- discount_amount
- tax_amount
- line_total

### `goods_receipts`

- id
- number
- purchase_order_id nullable
- supplier_id
- warehouse_id
- receipt_date
- status: `draft|posted|cancelled`
- notes nullable
- created_by

### `goods_receipt_items`

- id
- goods_receipt_id
- product_id
- unit_id
- quantity_received
- purchase_price

### `purchase_invoices`

- id
- number
- supplier_id
- purchase_order_id nullable
- goods_receipt_id nullable
- invoice_date
- due_date
- status: `draft|posted|partial_paid|paid|cancelled`
- subtotal
- discount_total
- tax_total
- grand_total
- outstanding_amount
- created_by

### `purchase_invoice_items`

- id
- purchase_invoice_id
- product_id
- unit_id
- quantity
- unit_price
- discount_amount
- tax_amount
- line_total

### `purchase_returns`

- id
- number
- supplier_id
- warehouse_id
- purchase_invoice_id nullable
- return_date
- status: `draft|posted|cancelled`
- reason
- total_amount
- created_by

### `purchase_return_items`

- id
- purchase_return_id
- product_id
- unit_id
- quantity
- unit_price
- line_total

## Sales and POS

### `cash_sessions`

- id
- branch_id
- opened_by
- opened_at
- opening_cash
- closed_by nullable
- closed_at nullable
- closing_cash nullable
- expected_cash nullable
- variance_amount nullable
- status: `open|closed`

### `sales_invoices`

- id
- number
- branch_id
- warehouse_id
- cash_session_id nullable
- customer_id nullable
- cashier_id
- sales_type: `pos|invoice|quotation`
- transaction_date
- due_date nullable
- status: `draft|posted|partial_paid|paid|cancelled`
- subtotal
- discount_total
- tax_total
- grand_total
- paid_amount
- outstanding_amount
- notes nullable

### `sales_invoice_items`

- id
- sales_invoice_id
- product_id
- unit_id
- quantity
- unit_price
- discount_amount
- tax_amount
- cost_amount
- line_total

### `sales_returns`

- id
- number
- sales_invoice_id nullable
- branch_id
- warehouse_id
- customer_id nullable
- return_date
- refund_type: `cash|store_credit|deduct_receivable`
- status: `draft|posted|cancelled`
- total_amount
- reason
- created_by

### `sales_return_items`

- id
- sales_return_id
- product_id
- unit_id
- quantity
- unit_price
- line_total

## Payments and Cash

### `payment_methods`

- id
- code
- name
- type: `cash|bank_transfer|qris|credit_card|debit_card|ewallet|tempo`
- requires_reference boolean
- is_active

### `cash_accounts`

- id
- branch_id nullable
- code
- name
- type: `cash|bank|ewallet`
- account_number nullable
- is_active

### `payments`

- id
- number
- payment_type: `customer_receipt|supplier_payment|refund|expense`
- payment_method_id
- cash_account_id nullable
- transaction_date
- partner_type: `customer|supplier|internal`
- partner_id nullable
- amount
- reference_number nullable
- notes nullable
- created_by

### `payment_allocations`

- id
- payment_id
- reference_type: `sales_invoice|purchase_invoice|sales_return|purchase_return`
- reference_id
- allocated_amount

## Inventory Control

### `inventory_movements`

- id
- movement_date
- warehouse_id
- product_id
- unit_id
- quantity_in
- quantity_out
- balance_after nullable
- cost_per_unit
- amount
- source_type
- source_id
- reference_number
- notes nullable
- created_by

### `stock_balances`

- id
- warehouse_id
- product_id
- quantity_on_hand
- quantity_reserved
- average_cost

### `stock_adjustments`

- id
- number
- warehouse_id
- adjustment_date
- reason
- status: `draft|posted|cancelled`
- created_by
- approved_by nullable

### `stock_adjustment_items`

- id
- stock_adjustment_id
- product_id
- unit_id
- system_quantity
- actual_quantity
- difference_quantity
- cost_per_unit

### `stock_transfers`

- id
- number
- from_warehouse_id
- to_warehouse_id
- transfer_date
- status: `draft|in_transit|received|cancelled`
- notes nullable
- created_by

### `stock_transfer_items`

- id
- stock_transfer_id
- product_id
- unit_id
- quantity
- cost_per_unit

### `stock_opnames`

- id
- number
- warehouse_id
- opname_date
- status: `draft|counting|reviewed|posted|cancelled`
- notes nullable
- created_by
- approved_by nullable

### `stock_opname_items`

- id
- stock_opname_id
- product_id
- unit_id
- counted_quantity
- system_quantity
- difference_quantity

## Relasi Utama

- satu `branch` punya banyak `warehouses`
- satu `product_category` punya banyak `products`
- satu `brand` punya banyak `products`
- satu `product` punya banyak `product_unit_conversions`
- satu `product` punya banyak `product_prices`
- satu `product` punya banyak `product_barcodes`
- satu `supplier` punya banyak `purchase_orders`
- satu `purchase_order` punya banyak `purchase_order_items`
- satu `goods_receipt` punya banyak `goods_receipt_items`
- satu `purchase_invoice` punya banyak `purchase_invoice_items`
- satu `customer` punya banyak `sales_invoices`
- satu `sales_invoice` punya banyak `sales_invoice_items`
- satu `sales_invoice` dapat punya banyak `sales_returns`
- satu `cash_session` punya banyak `sales_invoices`
- satu `warehouse` punya banyak `inventory_movements`
- satu kombinasi `warehouse + product` punya satu `stock_balances` aktif
