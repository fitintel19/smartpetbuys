# Kit Forms Setup Instructions

## Forms to Create in Your Kit Dashboard

### 1. Inline Content Form

**Purpose:** Mid-article conversions for engaged readers  
**Location:** Appears in the middle of blog posts  

**Kit Setup:**
1. Go to **Grow** → **Forms** → **Create Form**
2. Choose **Inline** form type
3. **Form Name:** "Inline Content Form - Blog Posts"
4. **Heading:** "Get More Pet Product Tips!"
5. **Description:** "Join thousands of smart pet parents getting our FREE buying guides and weekly product recommendations."
6. **Button Text:** "Get My Free Guide"
7. **Success Message:** "Success! Check your inbox for your FREE Pet Buying Guide!"

**Integration:**
- Copy the form ID from the form URL or embed code
- Replace `YOUR_FORM_ID` in `layouts/partials/kit-inline-form.html` with your actual form ID

---

### 2. Exit-Intent Popup Form

**Purpose:** Capture visitors before they leave  
**Location:** Appears when mouse leaves browser window  

**Kit Setup:**
1. Go to **Grow** → **Forms** → **Create Form**
2. Choose **Modal/Popup** form type  
3. **Form Name:** "Exit-Intent Popup"
4. **Heading:** "Wait! Don't Miss Out!"
5. **Description:** "Get our FREE Ultimate Pet Buying Guide before you go!"
6. **Button Text:** "Yes, Send My Free Guide!"
7. **Success Message:** "Perfect! Your FREE guide is on the way!"

**Integration:**
- Copy the form ID from the form URL or embed code
- Replace `YOUR_EXIT_FORM_ID` in `layouts/partials/kit-exit-intent.html` with your actual form ID

---

### 3. Additional Forms to Create Later

#### A. Category-Specific Forms
- **Dog Products Form:** For dog-focused content
- **Cat Products Form:** For cat-focused content  
- **Health & Wellness Form:** For health-related posts

#### B. Content Upgrade Forms
- **Product Comparison Form:** "Get our detailed comparison chart"
- **Buying Checklist Form:** "Download our buying checklist"
- **Seasonal Guide Form:** "Get our seasonal shopping guide"

---

## Form Settings Configuration

### Targeting & Triggers

**Inline Form:**
- **Trigger:** Always show
- **Frequency:** Once per session
- **Position:** Manual placement (via template)

**Exit-Intent Popup:**
- **Trigger:** Exit intent (handled by custom JavaScript)
- **Frequency:** Once per 24 hours (handled by localStorage)
- **Device:** Desktop and mobile (different triggers)

### Automation Integration

**Both forms should trigger:**
1. **SmartPetBuys Welcome Series** (your 5-email sequence)
2. **Tag:** "Blog-Subscriber" (for segmentation)
3. **Tag:** "Lead-Magnet-Downloaded" (for tracking)

---

## Testing Checklist

### After Form Creation:

✅ **Test form submission** on both desktop and mobile  
✅ **Verify email delivery** of welcome sequence  
✅ **Check form styling** matches your site design  
✅ **Test exit-intent trigger** (move mouse to browser top)  
✅ **Confirm localStorage** prevents popup spam  
✅ **Test mobile scroll trigger** (70% scroll activates popup)  

### Form Performance Targets:

- **Inline Form:** 3-8% conversion rate
- **Exit-Intent Popup:** 5-15% conversion rate  
- **Combined:** Should increase total email signups by 40-60%

---

## Next Steps After Setup

1. **Deploy forms** by replacing form IDs in template files
2. **Test thoroughly** on staging/development
3. **Monitor performance** in Kit analytics
4. **A/B test headlines** and copy for optimization
5. **Create content upgrades** for high-traffic posts

---

## Form ID Integration Points

**Files to update with your actual form IDs:**

1. `layouts/partials/kit-inline-form.html` - Line 18
2. `layouts/partials/kit-exit-intent.html` - Line 29

**Find your form IDs:**
- Kit Dashboard → Forms → Select Form → URL or Embed Code
- Format: Usually a short alphanumeric code like "abc123def"