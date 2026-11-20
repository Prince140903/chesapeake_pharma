# Website User Guide - Chesapeake Pharma

Complete walkthrough of all website features written in simple, easy-to-understand language.

---

## 📌 Quick Overview

The Chesapeake Pharma website has two main sections:

1. **Public Website** - Information about the company (anyone can view)
2. **Client Portal** - Private database access (login required)

There's also an **Admin Panel** for company staff.

---

## 🌐 PUBLIC WEBSITE

When you first visit the website, you see the public home page.

### What You'll Find on the Public Website

#### 1. Home Page (Landing Page)
**Where to find it:** Main website URL

**What's on it:**
- Company introduction and mission
- Hero image or banner
- Key services offered
- Leadership information
- Call-to-action buttons like "Schedule a Consultation"
- Logos of clients (if applicable)

**What to test:**
- Does the page load?
- Are images displayed?
- Can you click the buttons?
- Does it look good on mobile?

---

#### 2. About Page
**Where to find it:** /about

**What's on it:**
- Company background and history
- Team expertise and experience
- Company values and mission statement
- Why the company exists

**What to test:**
- Does page load?
- Is content readable?
- Are all team members displayed?
- Does it work on mobile?

---

#### 4. Leadership Page
**Where to find it:** /leadership

**What's on it:**
- Information about company leaders
- Team expertise and background
- Photos of team members
- Contact information

**What to test:**
- Do photos display?
- Is information accurate?
- Are all leaders listed?
- Mobile-friendly?

---

#### 5. Drug Insights Page
**Where to find it:** /drug-insights

**What's on it:**
- Industry intelligence and insights
- Drug delivery technology information
- Market trends and analysis
- Research or case studies

**What to test:**
- Does content load?
- Are images displayed?
- Is information organized?
- Mobile-friendly?

---

#### 6. Clients Page
**Where to find it:** /clients

**What's on it:**
- Logos of existing clients
- Client testimonials or case studies
- Trust and credibility information

**What to test:**
- Do logos display?
- Is layout organized?
- Mobile-friendly?

---

#### 7. Contact Page
**Where to find it:** /contact

**What's on it:**
- Company contact information (phone, email)
- Physical address (if applicable)
- Contact form to send messages
- Map or location information

**What to test:**
- Can you see contact information?
- Can you fill out the form?
- Do form validations work? (e.g., requires email format)
- Does form submit?
- Mobile-friendly?

---

## 🔐 CLIENT LOGIN & PORTAL ACCESS

### How to Log In as a Client

**Step 1: Find the Login Link**
- Look for "Client Login" on the website
- Usually in the header/navigation or footer

**Step 2: Click Client Login**
- You'll see a login form

**Step 3: Enter Your Credentials**
- Email: john@gmail.com
- Password: John#123

**Step 4: Click "Sign In"**
- The system will verify your credentials

**Step 5: You're Logged In!**
- You'll be taken to the Client Portal
- You can now access the drug database

### Login Page Features

**What you should see:**
- Email field (for entering your email)
- Password field (for entering your password)
- "Sign In" button
- "Request Access" link (for new clients)
- Back to public site link

**What to test:**
- [ ] Email field accepts input
- [ ] Password field hides your password (shows dots/asterisks)
- [ ] "Sign In" button is clickable
- [ ] Error messages appear for wrong credentials
- [ ] Error message appears if you leave fields blank
- [ ] Success message appears when logging in correctly

---

## 📊 CLIENT PORTAL

Once logged in, you have access to the private client portal.

### Portal Home Page
**Where you land after login:** /portal

**What's on it:**
- Welcome message
- Database options (usually DB1 and DB2)
- Quick access buttons to each database
- Logout button

**What to test:**
- [ ] Portal page loads after login
- [ ] You see database options
- [ ] You can click on databases
- [ ] Logout button is visible

---

### Database Sections (DB1 & DB2)

**What they are:**
- Different collections of drug data
- Each database has its own set of drugs
- You might have access to one or both

**Where to find them:**
- DB1 at: /portal/db1
- DB2 at: /portal/db2

**What's in each database:**
- Table of drugs with columns like:
  - Drug name
  - Company
  - Route (how it's delivered)
  - Device/formulation
  - Phase (clinical trial phase)
  - Indication (what it treats)
  - And other details

**What to test:**
- [ ] Both databases load
- [ ] Drug data displays in a table
- [ ] All columns are visible
- [ ] Data is readable
- [ ] Mobile-friendly (might need horizontal scroll)

---

### Search & Filter Features

**How to search:**
- Look for a search box at the top of the database
- Type in a drug name, company, or other search term
- Results should filter automatically

**What to test:**
- [ ] Search box accepts input
- [ ] Results filter as you type
- [ ] Searching for a drug name works
- [ ] Searching for a company works
- [ ] Searching for a route works
- [ ] "No results" message appears when nothing matches
- [ ] Results update when you clear search

---

### Drug Details

**How to view details:**
- Click on any drug row in the table
- A popup or modal window appears
- Shows all information about that drug

**What you see:**
- Full drug name
- Company name
- Route (subcutaneous, IV, oral, etc.)
- Device/formulation details
- Clinical phase
- Indication (what disease it treats)
- Other drug-specific information

**What to test:**
- [ ] Can click on a drug
- [ ] Details popup appears
- [ ] All information displays
- [ ] Popup is readable
- [ ] Can close the popup
- [ ] Mobile-friendly

---

### Logout

**How to log out:**
- Look for "Logout" or "Sign Out" button
- Usually in header or dropdown menu
- Click it

**What should happen:**
- You'll be logged out
- You'll be taken to the public website
- If you try to access /portal, you'll be redirected to login

**What to test:**
- [ ] Logout button is visible
- [ ] Can click logout
- [ ] Successfully logged out
- [ ] Can't access portal without logging in again

---

## 🛡️ ADMIN PANEL (Optional Testing)

If you're testing the admin features, here's what to know:

### How to Access Admin Panel

**Step 1: Add /admin to URL**
- Take the website URL
- Add `/admin` to the end
- Example: https://example.com/admin

**Step 2: Enter Admin Credentials**
- Email: phillip@gmail.com
- Password: phillip@123

**Step 3: Click Sign In**
- You'll see the admin dashboard

### What Admins Can Do

**1. Manage Users**
- View list of all clients
- Approve/reject access requests
- Manage permissions

**2. Manage Drugs**
- Add new drugs to database
- Edit drug information
- Delete drugs
- Import bulk data

**3. Manage Subscriptions**
- Create client subscriptions
- View active subscriptions
- Manage subscription tiers

**4. Process Requests**
- Review pending access requests
- Approve or deny new clients
- Send approval emails

**What to test:**
- [ ] Can access /admin
- [ ] Admin login works
- [ ] Admin dashboard displays
- [ ] All menu sections visible

---

## ✅ COMPLETE TESTING CHECKLIST

### Home Page
- [ ] Page loads without errors
- [ ] Hero image displays
- [ ] All text is readable
- [ ] Buttons are clickable
- [ ] "Schedule Consultation" button works
- [ ] No broken links
- [ ] Mobile-friendly

### About Page
- [ ] Page loads
- [ ] Content displays properly
- [ ] Team information clear
- [ ] Mobile-friendly

### Services Page
- [ ] Page loads
- [ ] All services listed
- [ ] Descriptions clear
- [ ] Images display
- [ ] Mobile-friendly

### Other Public Pages
- [ ] Leadership page works
- [ ] Contact page works
- [ ] Drug Insights page works
- [ ] Clients page works

### Client Login
- [ ] Login link visible
- [ ] Login form appears
- [ ] Email field works
- [ ] Password field works
- [ ] Can login with correct credentials
- [ ] Error for wrong credentials
- [ ] Error for empty fields
- [ ] Success message appears

### Client Portal
- [ ] Portal loads after login
- [ ] Database options visible
- [ ] DB1 data displays
- [ ] DB2 data displays
- [ ] Search works
- [ ] Can click on drugs
- [ ] Drug details display
- [ ] Can close drug details
- [ ] Logout button works

### Mobile Testing
- [ ] Home page works on phone
- [ ] Portal works on phone
- [ ] Login works on phone
- [ ] Text is readable
- [ ] Buttons are clickable
- [ ] Forms work
- [ ] No excessive scrolling needed

---

## 🎯 What Should Work

### When Everything is Working Correctly:

✅ All pages load quickly without errors  
✅ Text and images display properly  
✅ All buttons are clickable  
✅ Login works with correct credentials  
✅ Portal displays drug data  
✅ Search function filters results  
✅ Can view drug details  
✅ Can log out  
✅ Website works on mobile  
✅ No broken links or 404 errors  
✅ Error messages are helpful  

---

## ⚠️ Known Issues

### Admin & Client Session Overlap
If you have both `/admin` and `/portal` open in the same browser, the sessions can get confused.

**Workaround:**
- Use different browsers
- Use private/incognito windows
- Test one at a time

See `04_CRITICAL_ISSUES_REPORT.md` for details.

---

## 🔍 What to Look For

### Missing Features
- Can you search/filter drugs? (Should be able to)
- Can you export drug data? (Might not be available yet)
- Can you print drug details? (Might not be available)
- Can you upload drug data? (For admins only)

### User Experience
- Are error messages helpful?
- Are buttons clearly labeled?
- Is the layout organized?
- Is navigation intuitive?
- Does everything work on mobile?

### Performance
- Do pages load quickly?
- Do search results appear fast?
- Is the site responsive?

---
