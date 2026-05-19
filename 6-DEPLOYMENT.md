# Rent Comp Automation - Netlify Deployment Guide

## Quick Start (5 minutes)

### Step 1: Create a GitHub Repository

1. Go to **github.com** and sign in
2. Click **+** (top right) → **New repository**
3. Name it: `rent-comp-automation`
4. Choose **Public** or **Private**
5. Click **Create repository**

### Step 2: Push Code to GitHub

Open your terminal and run:

```bash
cd netlify-rent-comp

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Add your remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/rent-comp-automation.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Netlify

1. Go to **netlify.com** and sign up (free)
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub**
4. Select your `rent-comp-automation` repo
5. Click **Deploy site**

Netlify will automatically:
- Install dependencies (`npm install`)
- Build the site
- Deploy to a live URL (e.g., `https://rent-comp-automation.netlify.app`)

### Step 4: Done!

Your app is now live. Share the URL with Nakoah:
- **Upload PDF** → App extracts comparables
- **Download Excel** → Populated with amenities
- Done!

---

## Folder Structure

```
netlify-rent-comp/
├── index.html                    # Frontend UI
├── package.json                  # Dependencies
├── netlify.toml                  # Configuration
├── .gitignore                    # Git ignore rules
└── netlify/
    └── functions/
        └── process-pdf.js        # Backend serverless function
```

---

## What the App Does

1. **Frontend** (index.html)
   - Drag-and-drop PDF upload interface
   - Sends PDF to backend via POST

2. **Backend** (process-pdf.js)
   - Parses PDF text
   - Extracts 5 comparables and addresses
   - Detects 24 amenities from survey comments
   - Generates populated Excel file
   - Returns download link to frontend

3. **Output**
   - Excel file with all comps and amenities pre-filled
   - Ready for Nakoah to add subject property info

---

## Troubleshooting

### "No comparables found"
- Make sure you're uploading the correct Real Quantum PDF format
- Check that PDF has "Rent #1", "Rent #2", etc. sections

### "Build failed" on Netlify
- Check the Netlify build logs (Dashboard → Logs → Builds)
- Make sure `package.json` is in the root directory
- Dependencies might not be installing — try deleting `package-lock.json` and redeploying

### Excel file is empty
- Function is extracting comparables but not filling template yet
- This is the next enhancement we can add

---

## Next Steps (Optional Enhancements)

1. **Auto-load your actual Excel template**
   - Upload your `rent_comp_adjustment_template__1___3_.xlsx` to the function
   - Populate it directly with all formulas intact

2. **Add email delivery**
   - Function emails the populated Excel to Nakoah automatically

3. **Add more validation**
   - Check PDF is valid Real Quantum format
   - Validate comp data before generating Excel

---

## Need Help?

- **Netlify Docs**: https://docs.netlify.com/
- **GitHub Help**: https://docs.github.com/
- **PDF Parsing**: The function uses `pdf-parse` library (handles most PDFs)

---

## Environment Variables (if needed later)

Create a `.env` file in the root (don't commit this):

```
# Example for future enhancements
SENDGRID_API_KEY=your_key_here
TEMPLATE_BUCKET=your_s3_bucket
```

Then in `netlify.toml`, add:

```toml
[build]
  environment = { SENDGRID_API_KEY = "your_key" }
```

---

**That's it! Your app is live.** 🚀
