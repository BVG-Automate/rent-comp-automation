# 🎯 Rent Comp Automation

**Drag → Drop PDF → Get Excel with all comparables & amenities extracted.**

## Deploy in 3 Steps

### 1️⃣ **GitHub** (1 min)
```bash
# Anywhere on your computer:
git clone <this-repo>
cd netlify-rent-comp
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/rent-comp-automation.git
git push -u origin main
```

### 2️⃣ **Netlify** (1 min)
- Go to **netlify.com** → Sign up
- Click **Add new site** → **Import from Git**
- Select your GitHub repo
- ✅ **Done!** Your site is live

### 3️⃣ **Use It** (1 min)
- Open your Netlify URL
- Drag your Real Quantum PDF onto the upload zone
- Click **Download Excel**
- Share with Nakoah!

---

## What It Does

| Step | What Happens |
|------|-------------|
| **Upload PDF** | You drag your Real Quantum rent comp survey PDF |
| **Extract** | App extracts all 5 comparables and addresses |
| **Detect Amenities** | AI finds 24 amenities from survey comments |
| **Generate Excel** | Creates an Excel file with all data pre-filled |
| **Download** | You download the populated spreadsheet |

---

## Features

✅ Extracts 5 comparables from PDF  
✅ Auto-detects 24 amenities  
✅ Generates Excel file instantly  
✅ No coding required  
✅ Free to deploy (Netlify free tier)  
✅ Works with Real Quantum PDFs  

---

## File Structure

```
netlify-rent-comp/
├── index.html                          # Upload UI
├── package.json                        # Dependencies
├── netlify.toml                        # Config
├── .gitignore                          # Git ignore
└── netlify/functions/process-pdf.js    # Backend
```

---

## Full Setup Instructions

See **DEPLOYMENT.md** for detailed step-by-step guide.

---

## Next Steps

Currently extracts and generates a basic Excel. To add your **actual template** with all formulas:

1. Upload your `rent_comp_adjustment_template__1___3_.xlsx` 
2. Update `process-pdf.js` to load and populate it directly
3. Redeploy

Let me know if you want me to add this!

---

**Ready? Start with Step 1 above!** 🚀
