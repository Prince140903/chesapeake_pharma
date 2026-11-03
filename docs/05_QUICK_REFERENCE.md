# Quick Reference Cheat Sheet

Print this page for quick lookup while testing!

---

## 🎯 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Client** | john@gmail.com | John#123 |
| **Admin** | phillip@gmail.com | phillip@123 |

---

## 🌐 Website URLs

| Page | URL | What It Is |
|------|-----|-----------|
| Home | `/` | Main landing page |
| About | `/about` | Company information |
| Services | `/services` | What we offer |
| Leadership | `/leadership` | Team info |
| Drug Insights | `/drug-insights` | Industry intel |
| Clients | `/clients` | Client logos |
| Contact | `/contact` | Contact form |
| **Client Login** | `/login` | Log in here |
| **Client Portal** | `/portal` | Private database |
| **DB1** | `/portal/db1` | Drug database 1 |
| **DB2** | `/portal/db2` | Drug database 2 |
| **Admin** | `/admin` | Admin login |

---

## ✅ Testing Checklist (Short Version)

### Must Test
- [ ] All public pages load
- [ ] Images display
- [ ] Links work
- [ ] Login works with correct credentials
- [ ] Portal shows drug data
- [ ] Search works
- [ ] Can log out
- [ ] Works on mobile

### Should Test
- [ ] Admin login works
- [ ] Drug detail modal works
- [ ] Error messages appear for wrong password
- [ ] Mobile layout is readable

### Optional
- [ ] Admin features work
- [ ] Email notifications (if applicable)
- [ ] Export functionality (if applicable)

---

## 🐛 Known Bug Summary

**Issue:** Admin and client sessions overlap in same browser

**Solution:**
- Use different browsers, OR
- Use incognito windows, OR
- Test one at a time

**Full Details:** See `04_CRITICAL_ISSUES_REPORT.md`

---

## 📝 Issue Report Template

When you find a bug:

```
What: [Brief description]
When: [What were you doing?]
Expected: [What should happen?]
Actual: [What happened instead?]
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
Repeat: [ ] Every time [ ] Sometimes [ ] Once
```

---

## 🔍 What Should Be On Each Page

### Home Page
✓ Hero banner  
✓ "Schedule Consultation" button  
✓ Service overview  
✓ Team info  

### Client Portal
✓ Database options (DB1, DB2)  
✓ Search box  
✓ Drug table  
✓ Drug detail popup  
✓ Logout button  

### Admin Panel
✓ User management  
✓ Drug management  
✓ Subscriptions  
✓ Access requests  

---

## 📱 Mobile Testing

**Test on:**
- [ ] Phone (portrait)
- [ ] Phone (landscape)
- [ ] Tablet (portrait)
- [ ] Tablet (landscape)

**Look for:**
- [ ] Text is readable
- [ ] Buttons are clickable
- [ ] No excessive scrolling
- [ ] Images display
- [ ] Forms work

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Read guides | 20 min |
| Test public site | 20 min |
| Test client login/portal | 25 min |
| Test mobile | 15 min |
| Test admin | 10 min |
| Fill report | 30 min |
| **TOTAL** | **120 min** |

---

## 💡 Pro Tips

✅ Clear browser cache before testing  
✅ Use latest browser version  
✅ Test with good internet connection  
✅ Take screenshots of bugs  
✅ Note exact steps to repeat issues  
✅ Be thorough and patient  

---

## 🚨 DON'T Do This

❌ Don't open both `/admin` and `/portal` in same browser at same time  
❌ Don't try to hack the website  
❌ Don't test with old browser versions  
❌ Don't test on poor internet  
❌ Don't skip the mobile testing  

---

## 📊 Success = All YES

- [ ] All public pages work?
- [ ] Client login works?
- [ ] Portal shows data?
- [ ] Search works?
- [ ] Mobile works?
- [ ] No broken links?
- [ ] No error pages?
- [ ] Logout works?

---

## 🎯 If Something Breaks

**Troubleshooting:**

**Page won't load?**
→ Refresh page  
→ Clear browser cache  
→ Try different browser  

**Can't log in?**
→ Check credentials  
→ Clear cookies  
→ Try again  

**No data showing?**
→ Make sure you're logged in  
→ Try different browser  
→ Read the critical issues report  

**Mobile looks bad?**
→ This is what we test for! Document it  

---

## 📋 Documentation Files

| File | Purpose |
|------|---------|
| `00_START_HERE.md` | Overview & navigation |
| `01_QUICK_START_GUIDE.md` | Testing instructions |
| `02_WEBSITE_USER_GUIDE.md` | Feature walkthrough |
| `03_TESTING_REPORT_TEMPLATE.md` | Report form |
| `04_CRITICAL_ISSUES_REPORT.md` | Bug details |
| `05_QUICK_REFERENCE.md` | This file |

---

## 🆘 Quick Help

**Confused?** → Read `01_QUICK_START_GUIDE.md`  
**How do I...?** → Read `02_WEBSITE_USER_GUIDE.md`  
**About the bug?** → Read `04_CRITICAL_ISSUES_REPORT.md`  
**Where do I report?** → Fill `03_TESTING_REPORT_TEMPLATE.md`  

---

## ✨ Remember

✅ You're helping improve the website  
✅ Your feedback is valuable  
✅ Take your time - quality over speed  
✅ Document everything  
✅ Ask questions if confused  

---

**Good luck testing!** 🚀

Print this page for quick reference →
