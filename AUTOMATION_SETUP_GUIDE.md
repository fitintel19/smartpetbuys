# SmartPetBuys Blog Automation - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pip install openai frontmatter
```

### 2. Set OpenAI API Key

**For GitHub Actions (Production):**
1. Go to GitHub repository Settings
2. Navigate to Secrets and Variables → Actions
3. Add new secret: `OPENAI_API_KEY` with your OpenAI API key

**For Local Testing:**
```bash
# Windows
set OPENAI_API_KEY=your_api_key_here

# Linux/Mac
export OPENAI_API_KEY=your_api_key_here
```

### 3. Configure Keywords

Edit `keywords.csv` to mark keywords for publishing:
```csv
keyword,publish,priority,estimated_volume
best dog food for allergies,yes,high,1500
cat litter box cleaning,yes,medium,800
```

### 4. Run Generation

**Manual run:**
```bash
python scripts/generate_single_post.py
```

**Check system status:**
```bash
python scripts/keyword_manager.py stats
python scripts/duplicate_checker.py stats
```

## System Status Check

Run these commands to verify everything is working:

1. **Check publishable keywords:**
   ```bash
   python scripts/keyword_manager.py stats
   ```

2. **Check for duplicates:**
   ```bash
   python scripts/duplicate_checker.py stats
   ```

3. **Get keyword suggestions:**
   ```bash
   python scripts/keyword_manager.py suggest
   ```

## Automated Workflow

The system runs automatically via GitHub Actions:
- **Schedule:** Weekdays at 14:00 UTC
- **Trigger:** Push to main branch or manual dispatch
- **Requirements:** OPENAI_API_KEY secret must be configured

## Files Created

When running, the system creates:
- `content/posts/[slug]/index.md` - New blog posts
- `data/content_tracker.json` - Content tracking database (auto-created)

## Troubleshooting

### No Posts Generated
- Check that keywords.csv has `publish=yes` entries
- Verify OPENAI_API_KEY is set correctly
- Ensure keywords haven't reached usage limit (3 posts each)

### API Errors
- Check OpenAI API key validity
- Verify billing account has credits
- Monitor rate limits

### Content Quality Issues
- Review generated posts manually
- Adjust content validation settings in scripts
- Update product database for better integration

## Support

- **Technical issues:** Check GitHub Actions logs
- **Content quality:** Review and edit generated posts
- **System monitoring:** Run stats commands regularly

## Next Steps

Once Phase 1 is working:
1. Monitor content quality and engagement
2. Adjust keyword priorities based on performance
3. Expand product database
4. Plan Phase 2 enhancements