# 🤖 SmartPetBuys Automation Guide

## **How Your Automation Works**

### **Current Setup:**
- **Schedule**: Weekdays at 2:00 PM UTC (10:00 AM EST)
- **Trigger**: GitHub Actions workflow
- **Process**: AI generates 1200-1500 word affiliate blog posts
- **Deployment**: Auto-commits to GitHub → Cloudflare deploys

### **Keywords.csv Structure:**
```csv
keyword,publish,priority,estimated_volume
"best dog puzzle toys",yes,high,1200
```

**Columns:**
- `keyword`: The search term for the blog post
- `publish`: "yes" = generate post, "no" = skip
- `priority`: "high" = high search volume, "medium" = moderate
- `estimated_volume`: Monthly search volume (for planning)

## **📈 Optimization Strategy**

### **1. High-Value Keywords (Priority: High)**
These have the highest search volume and affiliate potential:

**Food & Nutrition:**
- "dog food for puppies" (2,000 searches/month)
- "best cat food for indoor cats" (1,600 searches/month)
- "pet health supplements" (1,500 searches/month)

**Health & Wellness:**
- "flea and tick prevention" (1,700 searches/month)
- "pet dental care products" (1,300 searches/month)
- "dog harness vs collar" (1,400 searches/month)

**Comfort & Training:**
- "memory foam dog beds" (1,400 searches/month)
- "best dog crate for training" (1,300 searches/month)
- "dog leash and collar" (1,800 searches/month)

### **2. Publishing Schedule**
**Current**: 5 posts per week (weekdays)
**Recommended**: 3-4 posts per week for quality control

### **3. Content Quality Control**
- Review generated posts before publishing
- Check product ID accuracy
- Ensure affiliate links work
- Verify SEO optimization

## **🎯 How to Manage Your Automation**

### **Adding New Keywords:**
1. Open `keywords.csv`
2. Add new keyword with `publish = "no"`
3. Set priority based on search volume
4. Change to `publish = "yes"` when ready

### **Pausing Automation:**
- Set all keywords to `publish = "no"`
- Or disable the GitHub Action

### **Manual Trigger:**
- Go to GitHub → Actions → "Auto Publish Content"
- Click "Run workflow"

### **Monitoring Performance:**
- Check Google Analytics for traffic
- Monitor affiliate earnings
- Review search rankings

## **📊 Current Performance**

**Published Today (5 posts):**
- ✅ "best dog puzzle toys"
- ✅ "cat grooming brush" 
- ✅ "dog food for puppies"
- ✅ "pet health supplements"
- ✅ "dog training treats"

**Next Batch (Ready to Activate):**
- 🔄 "best cat food for indoor cats"
- 🔄 "omega 3 supplements for dogs"
- 🔄 "calming supplements for anxious pets"
- 🔄 "best dog crate for training"

## **🚀 Advanced Tips**

### **1. Seasonal Content Planning**
- Summer: "dog cooling mat", "pet water fountain"
- Winter: "heated pet beds", "pet winter gear"
- Holidays: "pet holiday safety", "pet travel accessories"

### **2. Trending Keywords**
- Monitor Google Trends for pet products
- Add trending keywords to CSV
- Set high priority for trending topics

### **3. Competitor Analysis**
- Research competitor blog posts
- Identify gaps in their content
- Add those keywords to your list

### **4. Local SEO Opportunities**
- "pet stores near me"
- "dog groomer [city]"
- "veterinarian [city]"

## **⚠️ Important Notes**

### **Product ID Accuracy:**
- AI must use exact product IDs from `data/products.json`
- No inventing new IDs (e.g., collar-04 doesn't exist)
- Double-check generated content for accuracy

### **Content Review:**
- Always review AI-generated content
- Check for factual accuracy
- Ensure affiliate links are correct
- Verify product recommendations

### **SEO Optimization:**
- Generated posts include meta descriptions
- Use proper heading structure (H2, H3)
- Include internal links to other posts
- Add relevant tags and categories

## **📞 Support**

If automation fails:
1. Check GitHub Actions logs
2. Verify OpenAI API key is valid
3. Ensure `keywords.csv` format is correct
4. Check for duplicate post slugs

**Your automation is working perfectly!** The 5 posts generated today show the system is functioning as designed. Use this guide to optimize and scale your content strategy.
