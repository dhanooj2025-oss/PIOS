-- Supabase / PostgreSQL Database Schema for Pricing Intelligence Operating System (PIOS)
-- Phase 1: Operational Pricing Engine
-- Optimized for a secure multi-user architecture

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Exchange Rates Table (Global reference data)
CREATE TABLE IF NOT EXISTS currency_exchange_rates (
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate NUMERIC(15, 6) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (from_currency, to_currency)
);

-- 2. Employees (Workforce Economics)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    annual_salary NUMERIC(15, 2) NOT NULL,
    salary_currency VARCHAR(3) DEFAULT 'INR' NOT NULL,
    total_working_hours_month NUMERIC(5, 2) DEFAULT 176.0 NOT NULL,
    utilization_percent NUMERIC(5, 2) DEFAULT 80.0 NOT NULL,
    allocation_factor NUMERIC(5, 2) DEFAULT 1.0 NOT NULL,
    overhead_multiplier NUMERIC(5, 2) DEFAULT 1.0 NOT NULL,
    meetings_hours NUMERIC(5, 2) DEFAULT 0.0 NOT NULL,
    operations_hours NUMERIC(5, 2) DEFAULT 0.0 NOT NULL,
    leave_hours NUMERIC(5, 2) DEFAULT 0.0 NOT NULL,
    internal_support_hours NUMERIC(5, 2) DEFAULT 0.0 NOT NULL,
    learning_hours NUMERIC(5, 2) DEFAULT 0.0 NOT NULL,
    active_status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Infrastructure Services
CREATE TABLE IF NOT EXISTS infrastructure_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    monthly_cost NUMERIC(12, 2) NOT NULL,
    cost_currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    allocation_type VARCHAR(30) DEFAULT 'organization_wide' NOT NULL, -- organization_wide, department_wise, project_specific, usage_based
    allocation_percent NUMERIC(5, 2) DEFAULT 100.0 NOT NULL,
    team_mapping VARCHAR(100),
    project_dependency BOOLEAN DEFAULT FALSE NOT NULL,
    active_status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. SaaS Tools
CREATE TABLE IF NOT EXISTS saas_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- AI, Productivity, Dev
    monthly_cost NUMERIC(12, 2) NOT NULL,
    cost_currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    seats INTEGER DEFAULT 1 NOT NULL,
    allocation_percent NUMERIC(5, 2) DEFAULT 100.0 NOT NULL,
    ai_dependency BOOLEAN DEFAULT FALSE NOT NULL,
    active_status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Overhead Categories
CREATE TABLE IF NOT EXISTS overhead_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    monthly_cost NUMERIC(12, 2) NOT NULL,
    cost_currency VARCHAR(3) DEFAULT 'INR' NOT NULL,
    allocation_logic VARCHAR(50) DEFAULT 'capacity_division' NOT NULL,
    recurring BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Margin Policies
CREATE TABLE IF NOT EXISTS pricing_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_name VARCHAR(100) NOT NULL,
    minimum_safe_margin NUMERIC(5, 2) DEFAULT 25.0 NOT NULL,
    target_margin NUMERIC(5, 2) DEFAULT 35.0 NOT NULL,
    enterprise_margin NUMERIC(5, 2) DEFAULT 45.0 NOT NULL,
    contingency_default NUMERIC(5, 2) DEFAULT 10.0 NOT NULL,
    emergency_buffer NUMERIC(5, 2) DEFAULT 5.0 NOT NULL,
    pricing_mode VARCHAR(20) DEFAULT 'balanced' NOT NULL, -- conservative, balanced, aggressive
    active_status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Regional Benchmarks (Global reference data)
CREATE TABLE IF NOT EXISTS regional_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_name VARCHAR(50) UNIQUE NOT NULL, -- US, UK, UAE, India
    currency VARCHAR(3) NOT NULL,
    minimum_rate NUMERIC(10, 2) NOT NULL,
    average_rate NUMERIC(10, 2) NOT NULL,
    enterprise_rate NUMERIC(10, 2) NOT NULL,
    competitiveness_index NUMERIC(5, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Project Estimates
CREATE TABLE IF NOT EXISTS project_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name VARCHAR(150) NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    client_region VARCHAR(50) NOT NULL,
    project_type VARCHAR(50) NOT NULL,
    estimated_hours NUMERIC(10, 2) NOT NULL,
    delivery_timeline_days INTEGER NOT NULL,
    contract_type VARCHAR(30) DEFAULT 'fixed_cost' NOT NULL, -- fixed_cost, time_material, retainer, dedicated_team
    target_margin NUMERIC(5, 2) NOT NULL,
    contingency_percent NUMERIC(5, 2) NOT NULL,
    recommended_quote NUMERIC(15, 2) NOT NULL,
    billing_rate NUMERIC(10, 2) NOT NULL,
    risk_score NUMERIC(5, 2) NOT NULL,
    profitability_score NUMERIC(5, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' NOT NULL, -- draft, saved, locked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Project Resource Allocations
CREATE TABLE IF NOT EXISTS project_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES project_estimates(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    quantity NUMERIC(5, 2) DEFAULT 1.0 NOT NULL,
    allocated_hours NUMERIC(10, 2) NOT NULL,
    utilization_factor NUMERIC(5, 2) DEFAULT 1.0 NOT NULL,
    calculated_cost NUMERIC(15, 2) NOT NULL
);

-- 10. Milestone Structures
CREATE TABLE IF NOT EXISTS milestone_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES project_estimates(id) ON DELETE CASCADE,
    milestone_name VARCHAR(150) NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    due_date DATE,
    payment_delay_days INTEGER DEFAULT 0 NOT NULL,
    expected_cash_flow NUMERIC(15, 2) NOT NULL
);

-- 11. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action_type VARCHAR(20) NOT NULL, -- create, update, delete
    change_summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    customer_type VARCHAR(50) DEFAULT 'Other' NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    region VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active' NOT NULL,
    contact_person VARCHAR(150),
    designation VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    gst_number VARCHAR(50),
    tax_id VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'INR' NOT NULL,
    payment_terms VARCHAR(30) DEFAULT 'Net 30' NOT NULL,
    internal_notes TEXT,
    customer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 13. Recurring Revenues
CREATE TABLE IF NOT EXISTS recurring_revenues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name VARCHAR(150) NOT NULL,
    revenue_type VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR' NOT NULL,
    frequency VARCHAR(20) DEFAULT 'monthly' NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 14. Recurring Expenses
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    expense_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR' NOT NULL,
    frequency VARCHAR(20) DEFAULT 'monthly' NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    forecast_impact VARCHAR(20) DEFAULT 'medium' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 15. Receivables
CREATE TABLE IF NOT EXISTS receivables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    client VARCHAR(150) NOT NULL,
    invoice VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR' NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 16. Payables
CREATE TABLE IF NOT EXISTS payables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor VARCHAR(150) NOT NULL,
    expense VARCHAR(150) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR' NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 17. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name VARCHAR(150) NOT NULL,
    client_email VARCHAR(150),
    company_name VARCHAR(150),
    billing_address TEXT,
    gst_tax_id VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'INR' NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_terms VARCHAR(50) NOT NULL,
    items JSONB DEFAULT '[]'::jsonb NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    tax_amount NUMERIC(15, 2) NOT NULL,
    discount NUMERIC(15, 2) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    due_amount NUMERIC(15, 2) NOT NULL,
    terms_and_conditions TEXT,
    internal_notes TEXT,
    customer_notes TEXT,
    status VARCHAR(20) DEFAULT 'Draft' NOT NULL,
    payments JSONB DEFAULT '[]'::jsonb NOT NULL,
    receivable_id UUID REFERENCES receivables(id) ON DELETE SET NULL,
    project_name VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Database Performance Indexes
CREATE INDEX IF NOT EXISTS idx_project_estimates_client ON project_estimates(client_name);
CREATE INDEX IF NOT EXISTS idx_recurring_revenues_client ON recurring_revenues(client_name);
CREATE INDEX IF NOT EXISTS idx_receivables_client ON receivables(client);
CREATE INDEX IF NOT EXISTS idx_payables_vendor ON payables(vendor);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_name);

-- Populate initial exchange rates
INSERT INTO currency_exchange_rates (from_currency, to_currency, rate) VALUES
('USD', 'INR', 83.500000),
('GBP', 'INR', 106.000000),
('AED', 'INR', 22.700000),
('INR', 'USD', 0.011976),
('INR', 'GBP', 0.009434),
('INR', 'AED', 0.044053)
ON CONFLICT (from_currency, to_currency) DO UPDATE SET rate = EXCLUDED.rate;

-- Populate initial regional benchmarks
INSERT INTO regional_benchmarks (region_name, currency, minimum_rate, average_rate, enterprise_rate, competitiveness_index) VALUES
('US', 'USD', 100.00, 145.00, 220.00, 85.00),
('UK', 'GBP', 80.00, 110.00, 180.00, 75.00),
('UAE', 'USD', 90.00, 120.00, 190.00, 80.00),
('India', 'INR', 1800.00, 2500.00, 4000.00, 65.00)
ON CONFLICT (region_name) DO UPDATE SET 
    currency = EXCLUDED.currency,
    minimum_rate = EXCLUDED.minimum_rate,
    average_rate = EXCLUDED.average_rate,
    enterprise_rate = EXCLUDED.enterprise_rate,
    competitiveness_index = EXCLUDED.competitiveness_index;

-- Seed Employees (Defaults to user_id = NULL so they act as global fallback system records if RLS is bypassed or disabled)
INSERT INTO employees (id, role_name, department, annual_salary, salary_currency, total_working_hours_month, utilization_percent, allocation_factor, overhead_multiplier, meetings_hours, operations_hours, leave_hours, internal_support_hours, learning_hours, active_status) VALUES
('e1111111-1111-1111-1111-111111111111', 'Senior Developer', 'Engineering', 1440000.00, 'INR', 176.00, 85.00, 1.00, 1.10, 15.00, 10.00, 8.00, 12.00, 10.00, TRUE),
('e2222222-2222-2222-2222-222222222222', 'Junior Developer', 'Engineering', 720000.00, 'INR', 176.00, 80.00, 1.00, 1.00, 15.00, 8.00, 8.00, 5.00, 15.00, TRUE),
('e3333333-3333-3333-3333-333333333333', 'UI/UX Designer', 'Design', 960000.00, 'INR', 176.00, 75.00, 1.00, 1.00, 12.00, 8.00, 8.00, 10.00, 10.00, TRUE),
('e4444444-4444-4444-4444-444444444444', 'AI Engineer', 'Engineering', 1800000.00, 'INR', 176.00, 90.00, 1.20, 1.20, 10.00, 12.00, 8.00, 15.00, 15.00, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Infrastructure Services
INSERT INTO infrastructure_services (id, service_name, category, monthly_cost, cost_currency, allocation_type, allocation_percent, project_dependency, active_status) VALUES
('f1111111-1111-1111-1111-111111111111', 'AWS Servers', 'AWS', 800.00, 'USD', 'organization_wide', 100.00, FALSE, TRUE),
('f2222222-2222-2222-2222-222222222222', 'Supabase DB', 'Supabase', 25.00, 'USD', 'organization_wide', 100.00, FALSE, TRUE),
('f3333333-3333-3333-3333-333333333333', 'GPU Cluster Hosting', 'GPU Hosting', 1500.00, 'USD', 'project_specific', 100.00, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed SaaS Tools
INSERT INTO saas_tools (id, tool_name, category, monthly_cost, cost_currency, seats, allocation_percent, ai_dependency, active_status) VALUES
('d1111111-1111-1111-1111-111111111111', 'Cursor AI', 'AI', 20.00, 'USD', 5, 100.00, TRUE, TRUE),
('d2222222-2222-2222-2222-222222222222', 'Jira Enterprise', 'Productivity', 8.00, 'USD', 10, 80.00, FALSE, TRUE),
('d3333333-3333-3333-3333-333333333333', 'Slack Pro', 'Productivity', 6.00, 'USD', 15, 100.00, FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Overhead Categories
INSERT INTO overhead_categories (id, category_name, monthly_cost, cost_currency, allocation_logic, recurring) VALUES
('a1111111-1111-1111-1111-111111111111', 'Office Rent & Workspace', 80000.00, 'INR', 'capacity_division', TRUE),
('a2222222-2222-2222-2222-222222222222', 'HR & Legal Compliance', 35000.00, 'INR', 'capacity_division', TRUE),
('a3333333-3333-3333-3333-333333333333', 'Accounting & Taxes', 15000.00, 'INR', 'capacity_division', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Customers
INSERT INTO customers (id, name, company_name, customer_type, industry, website, region, status, contact_person, designation, email, phone, mobile, address, city, state, country, postal_code, gst_number, tax_id, currency, payment_terms, internal_notes, customer_notes, created_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'Acme Corp', 'Acme Corporation', 'Project', 'Technology', 'https://acme.com', 'US', 'Active', 'John Doe', 'Billing Manager', 'billing@acme.com', '+1-555-0199', '+1-555-0198', '123 Cloud Suite', 'Silicon Valley', 'CA', 'USA', '94025', 'US98218201', 'TX-98218201', 'INR', 'Net 15', 'Initial customer imported from mock invoice data.', 'Prefers electronic invoicing.', '2026-05-17 00:00:00+00'),
('c2222222-2222-2222-2222-222222222222', 'Nova Systems', 'Nova Systems Inc', 'AMC', 'Software Development', 'https://novasystems.com', 'UK', 'Active', 'Jane Smith', 'Director of Finance', 'accounts@novasystems.com', '+44-20-7946-0958', '+44-7911-123456', '45 Tech Way', 'London', 'Greater London', 'United Kingdom', 'EC1A 1BB', 'GB123456789', 'TAX-GB123456', 'USD', 'Net 30', 'Key AMC account in the UK.', 'Requires purchase order numbers on all invoices.', '2026-05-20 00:00:00+00'),
('c3333333-3333-3333-3333-333333333333', 'Globex Ltd', 'Globex Corporation', 'Retainer', 'Logistics', 'https://globex.com', 'UAE', 'Active', 'Bob Johnson', 'Accounts Payable', 'payables@globex.com', '+971-4-123-4567', '+971-50-123-4567', '78 Desert Road', 'Dubai', 'Dubai', 'UAE', '00000', 'AE987654321', 'TAX-AE987654', 'AED', 'Net 45', 'Retainer client based in Dubai.', 'Invoices should be in AED.', '2026-05-25 00:00:00+00'),
('c4444444-4444-4444-4444-444444444444', 'Cyberdyne Corp', 'Cyberdyne Systems', 'Dedicated Resource', 'Robotics', 'https://cyberdyne.com', 'India', 'Active', 'Sarah Connor', 'Finance Operations', 'finance@cyberdyne.com', '+91-80-1234-5678', '+91-98765-43210', '99 Automation Street', 'Bengaluru', 'Karnataka', 'India', '560001', '29AAAAA1111A1Z1', 'TAX-IN1111', 'INR', 'Custom', 'Sarah Connor handles finance.', 'Prefers invoices in INR.', '2026-06-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Seed Recurring Revenues
INSERT INTO recurring_revenues (id, client_name, revenue_type, amount, currency, frequency, start_date, end_date, status, notes) VALUES
('01111111-1111-1111-1111-111111111111', 'Client Retainer', 'retainer', 5000.00, 'INR', 'monthly', '2026-06-02', '2027-06-02', 'active', 'Monthly Client Retainer'),
('02222222-2222-2222-2222-222222222222', 'AMC - Initech', 'amc', 75000.00, 'INR', 'monthly', '2026-06-15', '2027-06-15', 'active', 'Annual Maintenance Contract'),
('03333333-3333-3333-3333-333333333333', 'Monthly Retainer', 'retainer', 60000.00, 'INR', 'monthly', '2026-06-30', '2027-06-30', 'active', 'Monthly Retainer'),
('04444444-4444-4444-4444-444444444444', 'Nexus Global', 'amc', 200000.00, 'INR', 'monthly', '2026-06-05', '2026-12-31', 'active', 'Nexus Global AMC'),
('05555555-5555-5555-5555-555555555555', 'Stark Ind', 'retainer', 400000.00, 'INR', 'monthly', '2026-06-10', '2027-02-14', 'active', 'Stark Ind Retainer'),
('06666666-6666-6666-6666-666666666666', 'TechNova', 'dedicated_resource', 300000.00, 'INR', 'monthly', '2026-06-20', '2026-08-31', 'active', 'TechNova Resources'),
('07777777-7777-7777-7777-777777777777', 'Acme Corp', 'product', 80000.00, 'INR', 'monthly', '2026-06-25', '2026-12-31', 'active', 'Acme Corp API'),
('08888888-8888-8888-8888-888888888888', 'Nova Systems', 'consulting', 570000.00, 'INR', 'monthly', '2026-06-28', '2026-10-31', 'active', 'Nova Systems Consulting')
ON CONFLICT (id) DO NOTHING;

-- Seed Recurring Expenses
INSERT INTO recurring_expenses (id, expense_name, category, amount, currency, frequency, start_date, end_date, status, forecast_impact) VALUES
('11111111-1111-1111-1111-111111111111', 'AWS Hosting', 'infrastructure', 42000.00, 'INR', 'monthly', '2026-06-04', '2027-12-31', 'active', 'medium'),
('22222222-2222-2222-2222-222222222222', 'OpenAI Subscription', 'ai_tools', 8000.00, 'INR', 'monthly', '2026-06-20', '2026-12-31', 'active', 'low'),
('33333333-3333-3333-3333-333333333333', 'Zoho One', 'software_licenses', 10000.00, 'INR', 'monthly', '2026-06-27', '2026-12-31', 'active', 'low'),
('44444444-4444-4444-4444-444444444444', 'Employee Payroll', 'payroll', 300000.00, 'INR', 'monthly', '2026-06-01', '2027-12-31', 'active', 'high'),
('55555555-5555-5555-5555-555555555555', 'AWS Cloud Hosting', 'infrastructure', 80000.00, 'INR', 'monthly', '2026-06-10', '2027-12-31', 'active', 'medium'),
('66666666-6666-6666-6666-666666666666', 'Cursor AI & SaaS tools', 'ai_tools', 40000.00, 'INR', 'monthly', '2026-06-15', '2026-12-31', 'active', 'low'),
('77777777-7777-7777-7777-777777777777', 'Rent & Utilities', 'operations', 30000.00, 'INR', 'monthly', '2026-06-18', '2026-12-31', 'active', 'medium'),
('88888888-8888-8888-8888-888888888888', 'Audit & Compliance', 'other', 20000.00, 'INR', 'monthly', '2026-06-22', '2026-12-31', 'active', 'low'),
('99999999-9999-9999-9999-999999999999', 'Marketing & Outbound', 'other', 30000.00, 'INR', 'monthly', '2026-06-28', '2026-12-31', 'active', 'high')
ON CONFLICT (id) DO NOTHING;

-- Seed Receivables
INSERT INTO receivables (id, client, invoice, amount, currency, due_date, status) VALUES
('b1111111-1111-1111-1111-111111111111', 'Acme Corp', 'INV-2026-001', 150000.00, 'INR', '2026-06-01', 'unpaid'),
('b2222222-2222-2222-2222-222222222222', 'Nova Systems', 'INV-2026-002', 80000.00, 'INR', '2026-06-08', 'unpaid'),
('b3333333-3333-3333-3333-333333333333', 'Globex Ltd', 'INV-2026-003', 250000.00, 'INR', '2026-06-12', 'unpaid'),
('b4444444-4444-4444-4444-444444444444', 'Cyberdyne Corp', 'INV-2026-004', 120000.00, 'INR', '2026-06-23', 'unpaid')
ON CONFLICT (id) DO NOTHING;

-- Seed Payables
INSERT INTO payables (id, vendor, expense, amount, currency, due_date, status) VALUES
('a5555555-5555-5555-5555-555555555555', 'Figma', 'Figma Subscription', 3000.00, 'INR', '2026-06-06', 'unpaid'),
('a6666666-6666-6666-6666-666666666666', 'Internet Provider', 'Internet Bill', 5000.00, 'INR', '2026-06-10', 'unpaid'),
('a7777777-7777-7777-7777-777777777777', 'Office Landlord', 'Office Rent', 60000.00, 'INR', '2026-06-18', 'unpaid'),
('a8888888-8888-8888-8888-888888888888', 'Payroll Provider', 'Payroll', 380000.00, 'INR', '2026-06-25', 'unpaid')
ON CONFLICT (id) DO NOTHING;

-- Seed Saved Estimates
INSERT INTO project_estimates (id, project_name, client_name, client_region, project_type, estimated_hours, delivery_timeline_days, contract_type, target_margin, contingency_percent, recommended_quote, billing_rate, risk_score, profitability_score, status) VALUES
('c5555555-5555-5555-5555-555555555555', 'Project Zenith', 'TechNova Solutions', 'US', 'fixed_cost', 800.00, 90, 'fixed_cost', 42.00, 12.00, 1400000.00, 1750.00, 92.00, 92.00, 'saved'),
('c6666666-6666-6666-6666-666666666666', 'Infrastructure Upgrade', 'Global Health Partners', 'UK', 'dedicated_team', 600.00, 60, 'dedicated_team', 18.00, 15.00, 850000.00, 1416.67, 62.00, 62.00, 'saved'),
('c7777777-7777-7777-7777-777777777777', 'Acme Corp HQ Reno', 'Acme Corporation', 'US', 'time_material', 350.00, 45, 'time_material', 38.20, 10.00, 124839.00, 356.68, 94.00, 94.00, 'saved'),
('c8888888-8888-8888-8888-888888888888', 'Stark Industries Plant', 'Stark Ind.', 'India', 'fixed_cost', 200.00, 30, 'fixed_cost', 24.50, 8.00, 82662.00, 413.31, 78.00, 78.00, 'saved')
ON CONFLICT (id) DO NOTHING;

-- Seed Invoices
INSERT INTO invoices (id, client_name, client_email, company_name, billing_address, gst_tax_id, currency, invoice_date, due_date, payment_terms, items, subtotal, tax_amount, discount, total_amount, due_amount, terms_and_conditions, internal_notes, customer_notes, status, payments, receivable_id, project_name) VALUES
('INV-2026-001', 'Acme Corp', 'billing@acme.com', 'Acme Corporation', '123 Cloud Suite, Silicon Valley, CA', 'US98218201', 'INR', '2026-05-17', '2026-06-01', 'Net 15', '[{"id": "1", "qty": 1, "rate": 150000, "amount": 150000, "taxPercent": 0, "description": "Cloud Infrastructure Setup & Optimization"}]'::jsonb, 150000.00, 0.00, 0.00, 150000.00, 150000.00, 'Please transfer within 15 days.', 'Initial setup project billing', 'Thank you for your business!', 'Sent', '[]'::jsonb, 'b1111111-1111-1111-1111-111111111111', 'Cloud Migration'),
('INV-2026-002', 'Nova Systems', 'accounts@novasystems.io', 'Nova Systems Inc', 'Suite 404, Tech Park, Boston, MA', 'US77182910', 'INR', '2026-05-24', '2026-06-08', 'Net 15', '[{"id": "1", "qty": 1, "rate": 80000, "amount": 80000, "taxPercent": 0, "description": "AI Agent System Architecture Blueprint"}]'::jsonb, 80000.00, 0.00, 0.00, 80000.00, 80000.00, 'Net 15. Standard terms apply.', 'Design phase milestone payment', 'Please let us know if any revisions are needed.', 'Sent', '[]'::jsonb, 'b2222222-2222-2222-2222-222222222222', 'AI Agent Integration'),
('INV-2026-003', 'Globex Ltd', 'billing@globex.co.uk', 'Globex Limited', '77 Canary Wharf, London, UK', 'GB22910283', 'INR', '2026-05-28', '2026-06-12', 'Net 15', '[{"id": "1", "qty": 1, "rate": 250000, "amount": 250000, "taxPercent": 0, "description": "UX Design System Sprint 1 & 2"}]'::jsonb, 250000.00, 0.00, 0.00, 250000.00, 150000.00, 'Net 15. 50% advance, 50% on delivery.', 'UX team retainer', 'Milestone 1 invoice.', 'Partial', '[{"notes": "First partial payment", "paymentDate": "2026-06-02", "amountReceived": 100000, "referenceNumber": "TXN-90182"}]'::jsonb, 'b3333333-3333-3333-3333-333333333333', 'UX Revamp & Retainer'),
('INV-2026-004', 'Cyberdyne Corp', 'admin@cyberdyne.co.jp', 'Cyberdyne Corp', 'Cyberdyne HQ, Tokyo, Japan', 'JP11290382', 'INR', '2026-06-08', '2026-06-23', 'Net 15', '[{"id": "1", "qty": 1, "rate": 120000, "amount": 120000, "taxPercent": 0, "description": "Security Audit & Server Maintenance Support"}]'::jsonb, 120000.00, 0.00, 0.00, 120000.00, 0.00, 'Thank you for your prompt payment.', 'Annual renewal support', 'Invoice paid in full.', 'Paid', '[{"notes": "Paid in full", "paymentDate": "2026-06-09", "amountReceived": 120000, "referenceNumber": "TXN-77291"}]'::jsonb, 'b4444444-4444-4444-4444-444444444444', 'Server AMC Support'),
('INV-2026-005', 'Acme Corp', 'billing@acme.com', 'Acme Corporation', '123 Cloud Suite, Silicon Valley, CA', 'US98218201', 'INR', '2026-06-07', '2026-06-22', 'Net 15', '[{"id": "1", "qty": 1, "rate": 95000, "amount": 95000, "taxPercent": 0, "description": "Website Redesign Proposal and Wireframes"}]'::jsonb, 95000.00, 0.00, 0.00, 95000.00, 95000.00, 'Draft invoice. Not yet finalized.', 'Draft version to be reviewed by account manager', 'Wireframes review invoice draft.', 'Draft', '[]'::jsonb, NULL, 'Brand Redesign')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) on all tables for secure multi-user configuration
ALTER TABLE currency_exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE overhead_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 1. Create RLS Policies for Global Reference Tables
CREATE POLICY "Allow read access for currency exchange rates" ON currency_exchange_rates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access for regional benchmarks" ON regional_benchmarks
    FOR SELECT TO authenticated USING (true);

-- 2. Create RLS Policies for Operational Tables (Tenant/User Isolation)
CREATE POLICY "user_isolation_policy" ON employees
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON infrastructure_services
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON saas_tools
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON overhead_categories
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON pricing_policies
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON project_estimates
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON project_resources
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON milestone_structures
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON audit_logs
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON customers
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON recurring_revenues
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON recurring_expenses
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON receivables
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON payables
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_isolation_policy" ON invoices
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
