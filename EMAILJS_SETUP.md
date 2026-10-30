# EmailJS Setup Guide

This document explains how to set up EmailJS for sending access request notifications to the admin.

## Overview

When a user submits a database access request through the `/register` page, the system:
1. Stores the request in the Supabase `access_requests` table
2. Sends an email notification to the admin via EmailJS
3. Displays a success message to the user

## Setup Instructions

### 1. Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account
3. Navigate to the Dashboard

### 2. Create an Email Service

1. In the Dashboard, click on **Email Services**
2. Click **Create New Service**
3. Choose your email provider (Gmail, Outlook, etc.) or use the EmailJS default service
4. Configure the service with your email credentials
5. Copy the **Service ID** (looks like: `service_xxxxxxx`)

### 3. Create an Email Template

1. Go to **Email Templates**
2. Click **Create New Template**
3. Design your email template for access requests

**Sample Template:**

```
Subject: New Database Access Request

Admin, 

A new database access request has been received:

Request ID: {{request_id}}
Name: {{user_name}}
Email: {{user_email}}
Company: {{company_name}}
Date: {{submission_date}}
Time: {{submission_time}}

Please review this request in the Admin Panel and approve or reject it.

Best regards,
Chesapeake Pharma Portal
```

**Template Parameters Used:**
- `{{request_id}}` - Unique request identifier
- `{{user_name}}` - Full name of the requester
- `{{user_email}}` - Email of the requester
- `{{company_name}}` - Company name
- `{{submission_date}}` - Date of submission
- `{{submission_time}}` - Time of submission

4. Save the template and copy the **Template ID** (looks like: `template_xxxxxxx`)

### 4. Get Your Public Key

1. Go to **Account** → **API Keys**
2. Copy your **Public Key** (starts with an underscore, looks like: `_xxxxxxxxxxxxxxx`)

### 5. Update Environment Variables

Update your `.env.local` file with:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=_xxxxxxxxxxxxxxx
NEXT_PUBLIC_ADMIN_EMAIL=admin@chesapeakepharma.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Database Schema

Make sure your Supabase database has the following table:

```sql
CREATE TABLE access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  assigned_database TEXT, -- 'DB1', 'DB2', 'both'
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP
);
```

## Testing

1. Navigate to `/register`
2. Fill in the access request form
3. Submit the form
4. Check your admin email for the notification
5. Verify the request appears in Supabase under `access_requests` table

## Troubleshooting

### Email not sending?
- Verify all environment variables are correctly set
- Check EmailJS dashboard for failed attempts
- Ensure your email service in EmailJS is properly configured
- Check browser console for errors

### Template variables not replacing?
- Make sure template parameter names match exactly (case-sensitive)
- Verify template parameters are wrapped in `{{` and `}}`

### Database errors?
- Ensure `access_requests` table exists in Supabase
- Check that all required columns are present
- Verify service role key has write access

## Admin Panel Integration

The admin can view, approve, or reject access requests from the Admin Panel at `/admin/users` (once implemented).

When approving, the admin can:
- Assign specific database access (DB1, DB2, or both)
- Add notes about the approval
- A user profile will be automatically created
