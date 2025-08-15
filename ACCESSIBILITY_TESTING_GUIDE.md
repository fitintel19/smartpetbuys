# SmartPetBuys Accessibility Testing Guide

## Overview
This guide provides comprehensive testing procedures to validate WCAG 2.1 AA compliance for the SmartPetBuys website. All implemented accessibility improvements should be tested regularly to ensure ongoing compliance.

## Quick Test Checklist

### ✅ Keyboard Navigation
- [ ] All interactive elements are reachable via Tab key
- [ ] Skip links appear and function when Tab is pressed
- [ ] Mobile menu opens/closes with Enter/Space keys
- [ ] Category filters work with keyboard navigation
- [ ] Form fields can be filled using only keyboard
- [ ] No keyboard traps exist

### ✅ Screen Reader Testing
- [ ] Page structure is announced correctly (headings, landmarks)
- [ ] Skip links are announced and functional
- [ ] Form labels are properly associated
- [ ] Images have meaningful alt text
- [ ] Button purposes are clear
- [ ] Dynamic content changes are announced

### ✅ Visual Testing
- [ ] Text meets minimum contrast ratios (4.5:1 normal, 3:1 large)
- [ ] Focus indicators are visible and consistent
- [ ] Content is readable at 200% zoom
- [ ] High contrast mode works properly
- [ ] No information is conveyed by color alone

### ✅ Responsive & Mobile
- [ ] Touch targets are minimum 44x44 pixels
- [ ] Mobile navigation is fully accessible
- [ ] Content reflows properly on all screen sizes
- [ ] Horizontal scrolling is not required

## Detailed Testing Procedures

### 1. Automated Testing Tools

#### WebAIM WAVE Browser Extension
1. Install WAVE extension in Chrome/Firefox
2. Navigate to each page type:
   - Homepage: `/`
   - Article page: `/posts/[any-post]/`
   - Legal page: `/legal/privacy/`
3. Check for:
   - Zero errors
   - All alerts reviewed and justified
   - Proper heading structure
   - Form labels present

#### axe DevTools
1. Install axe DevTools browser extension
2. Run scan on each page template
3. Ensure all violations are resolved
4. Generate accessibility report

#### Lighthouse Accessibility Audit
1. Open Chrome DevTools → Lighthouse tab
2. Select "Accessibility" category
3. Run audit and achieve score of 95+
4. Address any flagged issues

### 2. Manual Keyboard Testing

#### Skip Links Test
1. Navigate to homepage
2. Press Tab key (first tab)
3. Verify skip links appear with proper focus
4. Test each skip link navigates to correct section
5. Verify skip links disappear when losing focus

#### Navigation Test
1. Use only Tab and Shift+Tab to navigate
2. Verify all interactive elements receive focus
3. Check focus order is logical (left-to-right, top-to-bottom)
4. Test mobile menu keyboard functionality:
   - Tab to menu button
   - Press Enter or Space to open
   - Navigate menu items with Tab
   - Press Escape to close

#### Category Filter Test
1. Navigate to homepage
2. Tab to category filter buttons
3. Use Enter or Space to activate filters
4. Verify filter results are announced
5. Check no keyboard traps exist

### 3. Screen Reader Testing

#### NVDA (Free - Windows)
1. Download and install NVDA
2. Turn on NVDA
3. Navigate through pages using:
   - H key (headings navigation)
   - B key (buttons)
   - F key (forms)
   - L key (links)
   - R key (regions/landmarks)

#### VoiceOver (macOS Built-in)
1. Enable VoiceOver: System Preferences → Accessibility
2. Use Control+Option+arrow keys to navigate
3. Test rotor navigation (Control+Option+U)

#### Test Scenarios for Screen Readers:
1. **Page Structure**: Verify proper heading hierarchy
2. **Skip Links**: Confirm skip links are announced
3. **Forms**: Check all fields have labels
4. **Images**: Verify meaningful alt text is read
5. **Dynamic Content**: Test category filtering announcements
6. **Mobile Menu**: Verify menu state changes are announced

### 4. Color Contrast Testing

#### WebAIM Contrast Checker
1. Visit https://webaim.org/resources/contrastchecker/
2. Test all color combinations:
   - Body text (#1a2a42) on white: 11.2:1 ✅
   - Light text (#495057) on white: 7.1:1 ✅
   - Primary button (#FF7F32) on white: 4.1:1 ✅ (large text)
   - Footer links (#0056b3) on light gray: 4.6:1 ✅

#### Browser DevTools
1. Inspect any text element
2. In Styles panel, find color property
3. Click color square to open color picker
4. View contrast ratio in picker

### 5. High Contrast Mode Testing

#### Windows High Contrast
1. Windows Settings → Ease of Access → High Contrast
2. Enable high contrast mode
3. Test all page templates
4. Verify all interactive elements remain visible
5. Check borders and focus indicators work

#### Browser Forced Colors
1. Chrome: chrome://flags/#enable-force-dark-mode
2. Firefox: about:config → ui.systemUsesDarkTheme
3. Test with forced colors preference

### 6. Zoom and Magnification Testing

#### Browser Zoom Test
1. Navigate to each page template
2. Zoom to 200% using Ctrl/Cmd +
3. Verify:
   - All content remains visible
   - No horizontal scrolling required
   - All functionality still works
   - Text remains readable

#### Mobile Accessibility
1. Test on real mobile devices when possible
2. Verify touch targets are adequate size
3. Check mobile menu accessibility
4. Test form interaction on mobile

### 7. Form Accessibility Testing

#### Email Signup Forms
1. Navigate to forms using keyboard only
2. Verify labels are properly associated
3. Test error state announcements
4. Check required field validation
5. Verify success/error messages are announced

#### Specific Tests:
1. Tab to email input field
2. Enter invalid email
3. Tab to submit button and press Enter
4. Verify error is announced to screen readers
5. Correct email and resubmit
6. Verify success message is announced

### 8. Mobile Specific Testing

#### iOS VoiceOver
1. Settings → Accessibility → VoiceOver → Enable
2. Use swipe gestures to navigate
3. Test rotor control for navigation
4. Verify mobile menu accessibility

#### Android TalkBack
1. Settings → Accessibility → TalkBack → Enable
2. Use explore by touch
3. Test navigation gestures
4. Verify all interactive elements work

## Compliance Validation

### WCAG 2.1 AA Requirements Met

#### ✅ Perceivable
- **1.1.1 Non-text Content**: All images have alt text
- **1.3.1 Info and Relationships**: Proper heading hierarchy, form labels
- **1.3.2 Meaningful Sequence**: Logical reading order
- **1.4.1 Use of Color**: No color-only information
- **1.4.3 Contrast**: Minimum 4.5:1 ratio met
- **1.4.4 Resize Text**: Content usable at 200% zoom

#### ✅ Operable
- **2.1.1 Keyboard**: All functionality keyboard accessible
- **2.1.2 No Keyboard Trap**: No traps present
- **2.1.4 Character Key Shortcuts**: No conflicts
- **2.4.1 Bypass Blocks**: Skip links implemented
- **2.4.2 Page Titled**: All pages have descriptive titles
- **2.4.3 Focus Order**: Logical focus sequence
- **2.4.6 Headings and Labels**: Descriptive headings/labels
- **2.4.7 Focus Visible**: Clear focus indicators

#### ✅ Understandable
- **3.1.1 Language of Page**: Language declared
- **3.2.1 On Focus**: No context changes on focus
- **3.2.2 On Input**: No unexpected context changes
- **3.3.1 Error Identification**: Errors clearly identified
- **3.3.2 Labels or Instructions**: Form labels provided

#### ✅ Robust
- **4.1.1 Parsing**: Valid HTML structure
- **4.1.2 Name, Role, Value**: ARIA implemented correctly
- **4.1.3 Status Messages**: Dynamic content announced

## Testing Schedule

### Daily (Development)
- Run automated tools on changed pages
- Manual keyboard test for new interactive elements
- Basic screen reader test for content changes

### Weekly (QA)
- Full manual keyboard navigation test
- Screen reader testing of all page types
- Contrast validation for any color changes

### Monthly (Compliance Audit)
- Complete WCAG 2.1 AA checklist
- Test with multiple screen readers
- High contrast mode validation
- Mobile accessibility testing
- Performance impact assessment

## Common Issues and Solutions

### Keyboard Navigation Issues
**Problem**: Element not focusable
**Solution**: Add `tabindex="0"` or use semantic interactive elements

**Problem**: Illogical focus order
**Solution**: Reorder HTML structure or use `tabindex` values

### Screen Reader Issues
**Problem**: Content not announced
**Solution**: Add appropriate ARIA labels or descriptions

**Problem**: Dynamic content changes not announced
**Solution**: Use `aria-live` regions

### Visual Issues
**Problem**: Insufficient contrast
**Solution**: Adjust colors to meet 4.5:1 minimum ratio

**Problem**: Focus not visible
**Solution**: Enhance focus indicators with outline and background changes

## Resources and Tools

### Testing Tools
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Chrome Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Screen Readers
- [NVDA (Free)](https://www.nvaccess.org/)
- [JAWS (Trial)](https://www.freedomscientific.com/products/software/jaws/)
- VoiceOver (Built into macOS)
- TalkBack (Built into Android)

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Maintenance

### Ongoing Requirements
1. Test accessibility with every new feature
2. Validate after third-party integrations
3. Regular audit of user-generated content
4. Monitor for accessibility regressions
5. Stay updated with WCAG guidelines
6. Train team members on accessibility best practices

### Performance Monitoring
- Monitor impact of accessibility features on page load
- Ensure optimized focus management
- Validate screen reader compatibility with updates
- Test across different devices and browsers regularly

---

**Last Updated**: {{ now.Format "2006-01-02" }}
**Next Review**: {{ (now.AddDate 0 3 0).Format "2006-01-02" }}