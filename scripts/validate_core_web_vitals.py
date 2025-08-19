#!/usr/bin/env python3
"""
Core Web Vitals Validation Script for SmartPetBuys
Validates mobile-focused Core Web Vitals optimizations and performance improvements
Tests LCP, CLS, FID optimization implementations and mobile thresholds compliance
Version: 1.0
"""

import os
import re
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

class CoreWebVitalsValidator:
    def __init__(self, site_root: str):
        self.site_root = Path(site_root)
        self.results = []
        self.validation_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Core Web Vitals thresholds (Google "Good" ratings)
        self.cwv_thresholds = {
            'lcp': {'good': 2500, 'needs_improvement': 4000},  # ms
            'fid': {'good': 100, 'needs_improvement': 300},    # ms  
            'cls': {'good': 0.1, 'needs_improvement': 0.25},   # score
            'inp': {'good': 200, 'needs_improvement': 500}     # ms (future CWV)
        }
        
        # Mobile performance budgets
        self.mobile_budgets = {
            'hero_image_size': 150000,      # 150KB max for mobile hero images
            'critical_css_size': 14000,     # 14KB inline critical CSS
            'font_preload_count': 2,        # Max 2 preloaded fonts
            'resource_hints_count': 10,     # Max resource hints
            'js_bundle_size': 300000        # 300KB JavaScript budget for mobile
        }

    def run_validation(self) -> Dict[str, Any]:
        """Run comprehensive Core Web Vitals validation"""
        print("Starting Core Web Vitals Validation for Mobile Performance")
        print(f"Validation timestamp: {self.validation_timestamp}")
        print(f"Site root: {self.site_root}")
        print("=" * 70)
        
        # Run all validation tests
        self.validate_lcp_optimizations()
        self.validate_cls_prevention()
        self.validate_fid_optimizations()
        self.validate_core_web_vitals_monitoring()
        self.validate_performance_budget_system()
        self.validate_mobile_optimizations()
        self.validate_resource_optimization()
        
        # Generate comprehensive report
        return self.generate_validation_report()

    def validate_lcp_optimizations(self):
        """Validate Largest Contentful Paint optimizations"""
        print("\nValidating LCP (Largest Contentful Paint) Optimizations...")
        
        # Test 1: Hero image preloading implementation
        self.test_hero_image_preloading()
        
        # Test 2: Critical font preloading
        self.test_critical_font_preloading()
        
        # Test 3: Resource priority hints
        self.test_resource_priority_hints()
        
        # Test 4: Critical CSS inlining
        self.test_critical_css_inlining()
        
        # Test 5: LCP element optimization
        self.test_lcp_element_optimization()

    def test_hero_image_preloading(self):
        """Test hero image preloading for LCP optimization"""
        extend_head = self.site_root / "layouts/partials/extend_head.html"
        
        if not extend_head.exists():
            self.add_result("LCP_HERO_PRELOAD", "FAIL", "extend_head.html not found")
            return
            
        content = extend_head.read_text(encoding='utf-8')
        
        # Check for hero image preloading logic
        hero_preload_patterns = [
            r'LCP Optimization.*Hero Image Priority Preloading',
            r'fetchpriority="high".*hero.*image',
            r'rel="preload".*as="image".*featured_image',
            r'media="\(max-width: 414px\)".*preload.*image'
        ]
        
        passed_patterns = 0
        for pattern in hero_preload_patterns:
            if re.search(pattern, content, re.IGNORECASE | re.DOTALL):
                passed_patterns += 1
        
        if passed_patterns >= 3:
            self.add_result("LCP_HERO_PRELOAD", "PASS", 
                           f"Hero image preloading implemented with {passed_patterns}/4 optimization patterns")
        else:
            self.add_result("LCP_HERO_PRELOAD", "FAIL", 
                           f"Hero image preloading incomplete: {passed_patterns}/4 patterns found")

    def test_critical_font_preloading(self):
        """Test critical font preloading for LCP"""
        extend_head = self.site_root / "layouts/partials/extend_head.html"
        content = extend_head.read_text(encoding='utf-8')
        
        font_preload_checks = [
            r'rel="preload".*as="font".*Montserrat.*fetchpriority="high"',
            r'rel="preload".*as="font".*Open\+?Sans.*fetchpriority="high"',
            r'font-display:\s*swap',
            r'system-ui.*fallback.*font'
        ]
        
        passed_checks = sum(1 for pattern in font_preload_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 3:
            self.add_result("LCP_FONT_PRELOAD", "PASS", 
                           f"Critical font preloading optimized: {passed_checks}/4 checks passed")
        else:
            self.add_result("LCP_FONT_PRELOAD", "FAIL", 
                           f"Font preloading needs improvement: {passed_checks}/4 checks passed")

    def test_resource_priority_hints(self):
        """Test resource priority hints implementation"""
        extend_head = self.site_root / "layouts/partials/extend_head.html"
        content = extend_head.read_text(encoding='utf-8')
        
        priority_checks = [
            r'fetchpriority="high"',
            r'rel="preconnect".*fonts\.googleapis\.com',
            r'rel="preload".*critical',
            r'defer.*non-critical'
        ]
        
        passed_checks = sum(1 for pattern in priority_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 3:
            self.add_result("LCP_PRIORITY_HINTS", "PASS", 
                           f"Resource priority hints implemented: {passed_checks}/4 patterns")
        else:
            self.add_result("LCP_PRIORITY_HINTS", "WARNING", 
                           f"Priority hints could be improved: {passed_checks}/4 patterns")

    def test_critical_css_inlining(self):
        """Test critical CSS inlining for LCP"""
        extend_head = self.site_root / "layouts/partials/extend_head.html"
        content = extend_head.read_text(encoding='utf-8')
        
        critical_css_checks = [
            r'Critical CSS.*Inline',
            r'resources\.Get.*critical\.css',
            r'safeCSS',
            r'preload.*stylesheet.*onload'
        ]
        
        passed_checks = sum(1 for pattern in critical_css_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        # Check critical CSS file exists
        critical_css = self.site_root / "assets/css/extended/critical.css"
        css_exists = critical_css.exists()
        
        if passed_checks >= 3 and css_exists:
            # Check file size (should be under 14KB for mobile)
            css_size = critical_css.stat().st_size
            if css_size <= self.mobile_budgets['critical_css_size']:
                self.add_result("LCP_CRITICAL_CSS", "PASS", 
                               f"Critical CSS properly inlined, size: {css_size} bytes")
            else:
                self.add_result("LCP_CRITICAL_CSS", "WARNING", 
                               f"Critical CSS too large: {css_size} bytes (budget: {self.mobile_budgets['critical_css_size']})")
        else:
            self.add_result("LCP_CRITICAL_CSS", "FAIL", 
                           f"Critical CSS implementation incomplete: {passed_checks}/4 checks, exists: {css_exists}")

    def test_lcp_element_optimization(self):
        """Test LCP element optimization in Core Web Vitals optimizer"""
        cwv_optimizer = self.site_root / "assets/js/core-web-vitals-optimizer.js"
        
        if not cwv_optimizer.exists():
            self.add_result("LCP_ELEMENT_OPT", "FAIL", "Core Web Vitals optimizer not found")
            return
            
        content = cwv_optimizer.read_text(encoding='utf-8')
        
        lcp_optimization_checks = [
            r'setupLCPOptimization',
            r'preloadCriticalImages',
            r'largest-contentful-paint',
            r'fetchPriority.*high',
            r'LCP.*2500.*mobile'
        ]
        
        passed_checks = sum(1 for pattern in lcp_optimization_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("LCP_ELEMENT_OPT", "PASS", 
                           f"LCP element optimization implemented: {passed_checks}/5 features")
        else:
            self.add_result("LCP_ELEMENT_OPT", "FAIL", 
                           f"LCP optimization incomplete: {passed_checks}/5 features")

    def validate_cls_prevention(self):
        """Validate Cumulative Layout Shift prevention"""
        print("\nValidating CLS (Cumulative Layout Shift) Prevention...")
        
        # Test 1: Aspect ratio implementation
        self.test_aspect_ratio_implementation()
        
        # Test 2: Layout stability measures
        self.test_layout_stability()
        
        # Test 3: Dynamic content handling
        self.test_dynamic_content_cls_prevention()
        
        # Test 4: Font loading optimization
        self.test_font_loading_cls_prevention()

    def test_aspect_ratio_implementation(self):
        """Test aspect ratio implementation for CLS prevention"""
        cwv_css = self.site_root / "assets/css/extended/core-web-vitals.css"
        
        if not cwv_css.exists():
            self.add_result("CLS_ASPECT_RATIO", "FAIL", "Core Web Vitals CSS not found")
            return
            
        content = cwv_css.read_text(encoding='utf-8')
        
        aspect_ratio_checks = [
            r'aspect-ratio:\s*16\s*/\s*9',
            r'aspect-ratio:\s*4\s*/\s*3',
            r'aspect-ratio:\s*1\s*/\s*1',
            r'min-height.*\d+px',
            r'@media.*max-width.*768px.*aspect-ratio'
        ]
        
        passed_checks = sum(1 for pattern in aspect_ratio_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("CLS_ASPECT_RATIO", "PASS", 
                           f"Aspect ratio CLS prevention implemented: {passed_checks}/5 patterns")
        else:
            self.add_result("CLS_ASPECT_RATIO", "WARNING", 
                           f"Aspect ratio implementation could be improved: {passed_checks}/5 patterns")

    def test_layout_stability(self):
        """Test layout stability measures"""
        cwv_css = self.site_root / "assets/css/extended/core-web-vitals.css"
        content = cwv_css.read_text(encoding='utf-8')
        
        stability_checks = [
            r'contain:\s*layout',
            r'min-height.*product-card',
            r'min-height.*form-container',
            r'skeleton.*loading',
            r'transform.*translateZ\(0\)'
        ]
        
        passed_checks = sum(1 for pattern in stability_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("CLS_LAYOUT_STABILITY", "PASS", 
                           f"Layout stability measures implemented: {passed_checks}/5 checks")
        else:
            self.add_result("CLS_LAYOUT_STABILITY", "FAIL", 
                           f"Layout stability needs improvement: {passed_checks}/5 checks")

    def test_dynamic_content_cls_prevention(self):
        """Test dynamic content CLS prevention"""
        cwv_css = self.site_root / "assets/css/extended/core-web-vitals.css"
        content = cwv_css.read_text(encoding='utf-8')
        
        dynamic_checks = [
            r'ml-form.*min-height',
            r'ad-slot.*min-height',
            r'embed-container',
            r'iframe.*aspect-ratio',
            r'social-sharing.*min-height'
        ]
        
        passed_checks = sum(1 for pattern in dynamic_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("CLS_DYNAMIC_CONTENT", "PASS", 
                           f"Dynamic content CLS prevention: {passed_checks}/5 patterns")
        else:
            self.add_result("CLS_DYNAMIC_CONTENT", "WARNING", 
                           f"Dynamic content handling could be improved: {passed_checks}/5 patterns")

    def test_font_loading_cls_prevention(self):
        """Test font loading CLS prevention"""
        extend_head = self.site_root / "layouts/partials/extend_head.html"
        content = extend_head.read_text(encoding='utf-8')
        
        font_cls_checks = [
            r'font-display:\s*swap',
            r'system-ui.*fallback',
            r'font-loading.*class',
            r'fonts\.ready',
            r'fonts-loaded.*class'
        ]
        
        passed_checks = sum(1 for pattern in font_cls_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("CLS_FONT_LOADING", "PASS", 
                           f"Font loading CLS prevention implemented: {passed_checks}/5 checks")
        else:
            self.add_result("CLS_FONT_LOADING", "FAIL", 
                           f"Font loading CLS prevention incomplete: {passed_checks}/5 checks")

    def validate_fid_optimizations(self):
        """Validate First Input Delay optimizations"""
        print("\nValidating FID (First Input Delay) Optimizations...")
        
        # Test 1: JavaScript optimization
        self.test_javascript_optimization()
        
        # Test 2: Input handling optimization
        self.test_input_handling_optimization()
        
        # Test 3: Code splitting implementation
        self.test_code_splitting()
        
        # Test 4: Long task prevention
        self.test_long_task_prevention()

    def test_javascript_optimization(self):
        """Test JavaScript optimization for FID"""
        extend_head = self.site_root / "layouts/partials/extend_head.html"
        content = extend_head.read_text(encoding='utf-8')
        
        js_opt_checks = [
            r'defer.*script',
            r'async.*script',
            r'loadGA.*interaction',
            r'requestIdleCallback',
            r'addEventListener.*once.*passive'
        ]
        
        passed_checks = sum(1 for pattern in js_opt_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("FID_JS_OPTIMIZATION", "PASS", 
                           f"JavaScript optimization implemented: {passed_checks}/5 patterns")
        else:
            self.add_result("FID_JS_OPTIMIZATION", "WARNING", 
                           f"JavaScript optimization could be improved: {passed_checks}/5 patterns")

    def test_input_handling_optimization(self):
        """Test input handling optimization"""
        cwv_optimizer = self.site_root / "assets/js/core-web-vitals-optimizer.js"
        content = cwv_optimizer.read_text(encoding='utf-8')
        
        input_opt_checks = [
            r'setupFIDOptimization',
            r'optimizeInputHandling',
            r'debounce.*input',
            r'passive.*event',
            r'first-input.*delay'
        ]
        
        passed_checks = sum(1 for pattern in input_opt_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("FID_INPUT_HANDLING", "PASS", 
                           f"Input handling optimization implemented: {passed_checks}/5 features")
        else:
            self.add_result("FID_INPUT_HANDLING", "FAIL", 
                           f"Input handling optimization incomplete: {passed_checks}/5 features")

    def test_code_splitting(self):
        """Test code splitting implementation"""
        cwv_optimizer = self.site_root / "assets/js/core-web-vitals-optimizer.js"
        content = cwv_optimizer.read_text(encoding='utf-8')
        
        code_split_checks = [
            r'implementCodeSplitting',
            r'loadModule.*dynamic',
            r'import.*modulePath',
            r'loadRouteSpecificCode',
            r'loadFeatureSpecificCode'
        ]
        
        passed_checks = sum(1 for pattern in code_split_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("FID_CODE_SPLITTING", "PASS", 
                           f"Code splitting implemented: {passed_checks}/5 features")
        else:
            self.add_result("FID_CODE_SPLITTING", "WARNING", 
                           f"Code splitting could be enhanced: {passed_checks}/5 features")

    def test_long_task_prevention(self):
        """Test long task prevention"""
        cwv_optimizer = self.site_root / "assets/js/core-web-vitals-optimizer.js"
        content = cwv_optimizer.read_text(encoding='utf-8')
        
        long_task_checks = [
            r'breakUpLongTasks',
            r'scheduleWorkInChunks',
            r'timeSlicing',
            r'setTimeout.*chunk',
            r'requestAnimationFrame'
        ]
        
        passed_checks = sum(1 for pattern in long_task_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("FID_LONG_TASK_PREVENTION", "PASS", 
                           f"Long task prevention implemented: {passed_checks}/5 techniques")
        else:
            self.add_result("FID_LONG_TASK_PREVENTION", "FAIL", 
                           f"Long task prevention incomplete: {passed_checks}/5 techniques")

    def validate_core_web_vitals_monitoring(self):
        """Validate Core Web Vitals monitoring system"""
        print("\nValidating Core Web Vitals Monitoring System...")
        
        # Test 1: Performance Observer implementation
        self.test_performance_observer()
        
        # Test 2: Real User Monitoring
        self.test_real_user_monitoring()
        
        # Test 3: Analytics integration
        self.test_analytics_integration()
        
        # Test 4: Mobile-specific monitoring
        self.test_mobile_monitoring()

    def test_performance_observer(self):
        """Test Performance Observer implementation"""
        cwv_optimizer = self.site_root / "assets/js/core-web-vitals-optimizer.js"
        perf_monitor = self.site_root / "assets/js/performance-monitor.js"
        
        files_to_check = [f for f in [cwv_optimizer, perf_monitor] if f.exists()]
        
        if not files_to_check:
            self.add_result("CWV_PERFORMANCE_OBSERVER", "FAIL", "No performance monitoring files found")
            return
        
        observer_checks = [
            r'PerformanceObserver',
            r'largest-contentful-paint',
            r'first-input',
            r'layout-shift',
            r'observe.*entryTypes'
        ]
        
        total_passed = 0
        for file_path in files_to_check:
            content = file_path.read_text(encoding='utf-8')
            passed_checks = sum(1 for pattern in observer_checks 
                               if re.search(pattern, content, re.IGNORECASE))
            total_passed += passed_checks
        
        if total_passed >= 8:  # At least 4 checks across 2 files
            self.add_result("CWV_PERFORMANCE_OBSERVER", "PASS", 
                           f"Performance Observer properly implemented: {total_passed} patterns found")
        else:
            self.add_result("CWV_PERFORMANCE_OBSERVER", "FAIL", 
                           f"Performance Observer implementation incomplete: {total_passed} patterns found")

    def test_real_user_monitoring(self):
        """Test Real User Monitoring implementation"""
        cwv_optimizer = self.site_root / "assets/js/core-web-vitals-optimizer.js"
        content = cwv_optimizer.read_text(encoding='utf-8')
        
        rum_checks = [
            r'setupRealUserMonitoring',
            r'deviceInfo',
            r'connectionInfo',
            r'performanceHistory',
            r'sendBeacon.*metrics'
        ]
        
        passed_checks = sum(1 for pattern in rum_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("CWV_REAL_USER_MONITORING", "PASS", 
                           f"Real User Monitoring implemented: {passed_checks}/5 features")
        else:
            self.add_result("CWV_REAL_USER_MONITORING", "WARNING", 
                           f"RUM implementation could be enhanced: {passed_checks}/5 features")

    def test_analytics_integration(self):
        """Test analytics integration for Core Web Vitals"""
        files_to_check = [
            self.site_root / "assets/js/core-web-vitals-optimizer.js",
            self.site_root / "assets/js/performance-monitor.js",
            self.site_root / "layouts/partials/extend_head.html"
        ]
        
        analytics_checks = [
            r'gtag.*event.*core_web_vital',
            r'gtag.*event.*performance',
            r'metric_name.*metric_value',
            r'device_type.*mobile',
            r'connection_type'
        ]
        
        total_passed = 0
        for file_path in files_to_check:
            if file_path.exists():
                content = file_path.read_text(encoding='utf-8')
                passed_checks = sum(1 for pattern in analytics_checks 
                                   if re.search(pattern, content, re.IGNORECASE))
                total_passed += passed_checks
        
        if total_passed >= 6:
            self.add_result("CWV_ANALYTICS_INTEGRATION", "PASS", 
                           f"Analytics integration implemented: {total_passed} patterns found")
        else:
            self.add_result("CWV_ANALYTICS_INTEGRATION", "WARNING", 
                           f"Analytics integration could be improved: {total_passed} patterns found")

    def test_mobile_monitoring(self):
        """Test mobile-specific monitoring"""
        cwv_optimizer = self.site_root / "assets/js/core-web-vitals-optimizer.js"
        content = cwv_optimizer.read_text(encoding='utf-8')
        
        mobile_checks = [
            r'setupMobileSpecificMonitoring',
            r'detectMobile',
            r'isMobile.*768',
            r'touchSupported',
            r'orientationchange'
        ]
        
        passed_checks = sum(1 for pattern in mobile_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("CWV_MOBILE_MONITORING", "PASS", 
                           f"Mobile-specific monitoring implemented: {passed_checks}/5 features")
        else:
            self.add_result("CWV_MOBILE_MONITORING", "FAIL", 
                           f"Mobile monitoring incomplete: {passed_checks}/5 features")

    def validate_performance_budget_system(self):
        """Validate performance budget implementation"""
        print("\nValidating Performance Budget System...")
        
        # Test 1: Budget definition and thresholds
        self.test_budget_thresholds()
        
        # Test 2: Budget monitoring
        self.test_budget_monitoring()
        
        # Test 3: Violation detection and alerting
        self.test_violation_detection()
        
        # Test 4: Mobile budget enforcement
        self.test_mobile_budget_enforcement()

    def test_budget_thresholds(self):
        """Test performance budget thresholds"""
        budget_monitor = self.site_root / "assets/js/performance-budget.js"
        
        if not budget_monitor.exists():
            self.add_result("BUDGET_THRESHOLDS", "FAIL", "Performance budget monitor not found")
            return
            
        content = budget_monitor.read_text(encoding='utf-8')
        
        threshold_checks = [
            r'lcp.*2500',  # LCP threshold
            r'fid.*100',   # FID threshold
            r'cls.*0\.1',  # CLS threshold
            r'mobile.*1000000',  # Mobile page size budget
            r'totalJavaScript.*300000'  # Mobile JS budget
        ]
        
        passed_checks = sum(1 for pattern in threshold_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("BUDGET_THRESHOLDS", "PASS", 
                           f"Performance budget thresholds defined: {passed_checks}/5 budgets")
        else:
            self.add_result("BUDGET_THRESHOLDS", "FAIL", 
                           f"Budget thresholds incomplete: {passed_checks}/5 budgets")

    def test_budget_monitoring(self):
        """Test budget monitoring implementation"""
        budget_monitor = self.site_root / "assets/js/performance-budget.js"
        content = budget_monitor.read_text(encoding='utf-8')
        
        monitoring_checks = [
            r'setupBudgetMonitoring',
            r'checkResourceSize',
            r'checkCoreWebVital',
            r'monitorBudgetCompliance',
            r'reportBudgetViolation'
        ]
        
        passed_checks = sum(1 for pattern in monitoring_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("BUDGET_MONITORING", "PASS", 
                           f"Budget monitoring implemented: {passed_checks}/5 functions")
        else:
            self.add_result("BUDGET_MONITORING", "FAIL", 
                           f"Budget monitoring incomplete: {passed_checks}/5 functions")

    def test_violation_detection(self):
        """Test violation detection and alerting"""
        budget_monitor = self.site_root / "assets/js/performance-budget.js"
        content = budget_monitor.read_text(encoding='utf-8')
        
        violation_checks = [
            r'reportBudgetViolation',
            r'checkViolationSeverity',
            r'triggerHighSeverityAlert',
            r'sendAlertToMonitoring',
            r'violations.*push'
        ]
        
        passed_checks = sum(1 for pattern in violation_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("BUDGET_VIOLATION_DETECTION", "PASS", 
                           f"Violation detection implemented: {passed_checks}/5 features")
        else:
            self.add_result("BUDGET_VIOLATION_DETECTION", "WARNING", 
                           f"Violation detection could be improved: {passed_checks}/5 features")

    def test_mobile_budget_enforcement(self):
        """Test mobile-specific budget enforcement"""
        budget_monitor = self.site_root / "assets/js/performance-budget.js"
        content = budget_monitor.read_text(encoding='utf-8')
        
        mobile_budget_checks = [
            r'getMobileBudgets',
            r'detectMobile',
            r'isMobile.*\?.*1000000.*2000000',  # Mobile vs desktop budgets
            r'mobile.*300000.*500000',  # Mobile vs desktop JS budgets
            r'device_type.*mobile'
        ]
        
        passed_checks = sum(1 for pattern in mobile_budget_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("BUDGET_MOBILE_ENFORCEMENT", "PASS", 
                           f"Mobile budget enforcement implemented: {passed_checks}/5 checks")
        else:
            self.add_result("BUDGET_MOBILE_ENFORCEMENT", "FAIL", 
                           f"Mobile budget enforcement incomplete: {passed_checks}/5 checks")

    def validate_mobile_optimizations(self):
        """Validate mobile-specific optimizations"""
        print("\nValidating Mobile-Specific Optimizations...")
        
        # Test 1: Mobile-first responsive design
        self.test_mobile_first_design()
        
        # Test 2: Touch optimization
        self.test_touch_optimization()
        
        # Test 3: Connection-aware loading
        self.test_connection_aware_loading()
        
        # Test 4: Mobile performance CSS
        self.test_mobile_performance_css()

    def test_mobile_first_design(self):
        """Test mobile-first responsive design"""
        cwv_css = self.site_root / "assets/css/extended/core-web-vitals.css"
        content = cwv_css.read_text(encoding='utf-8')
        
        mobile_first_checks = [
            r'@media.*max-width.*768px',
            r'min-width.*44px.*min-height.*44px',  # Touch targets
            r'aspect-ratio.*mobile',
            r'mobile.*animation-duration',
            r'contain.*layout'
        ]
        
        passed_checks = sum(1 for pattern in mobile_first_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("MOBILE_FIRST_DESIGN", "PASS", 
                           f"Mobile-first design implemented: {passed_checks}/5 patterns")
        else:
            self.add_result("MOBILE_FIRST_DESIGN", "WARNING", 
                           f"Mobile-first design could be improved: {passed_checks}/5 patterns")

    def test_touch_optimization(self):
        """Test touch optimization"""
        cwv_css = self.site_root / "assets/css/extended/core-web-vitals.css"
        content = cwv_css.read_text(encoding='utf-8')
        
        touch_checks = [
            r'hover:\s*none.*pointer:\s*coarse',
            r'touchstart.*passive',
            r'min-width.*44px',
            r'transform.*scale.*active',
            r'touch.*optimization'
        ]
        
        passed_checks = sum(1 for pattern in touch_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 3:
            self.add_result("MOBILE_TOUCH_OPTIMIZATION", "PASS", 
                           f"Touch optimization implemented: {passed_checks}/5 patterns")
        else:
            self.add_result("MOBILE_TOUCH_OPTIMIZATION", "WARNING", 
                           f"Touch optimization could be enhanced: {passed_checks}/5 patterns")

    def test_connection_aware_loading(self):
        """Test connection-aware loading"""
        extend_head = self.site_root / "layouts/partials/extend_head.html"
        content = extend_head.read_text(encoding='utf-8')
        
        connection_checks = [
            r'navigator\.connection',
            r'effectiveType',
            r'saveData',
            r'isSlowConnection',
            r'prefetch.*faster.*connection'
        ]
        
        passed_checks = sum(1 for pattern in connection_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("MOBILE_CONNECTION_AWARE", "PASS", 
                           f"Connection-aware loading implemented: {passed_checks}/5 features")
        else:
            self.add_result("MOBILE_CONNECTION_AWARE", "FAIL", 
                           f"Connection-aware loading incomplete: {passed_checks}/5 features")

    def test_mobile_performance_css(self):
        """Test mobile performance CSS optimizations"""
        cwv_css = self.site_root / "assets/css/extended/core-web-vitals.css"
        
        if not cwv_css.exists():
            self.add_result("MOBILE_PERFORMANCE_CSS", "FAIL", "Core Web Vitals CSS not found")
            return
            
        content = cwv_css.read_text(encoding='utf-8')
        
        performance_css_checks = [
            r'prefers-reduced-motion',
            r'prefers-color-scheme.*dark',
            r'prefers-contrast.*high',
            r'will-change.*auto',
            r'transform.*translateZ\(0\)'
        ]
        
        passed_checks = sum(1 for pattern in performance_css_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("MOBILE_PERFORMANCE_CSS", "PASS", 
                           f"Mobile performance CSS implemented: {passed_checks}/5 optimizations")
        else:
            self.add_result("MOBILE_PERFORMANCE_CSS", "WARNING", 
                           f"Mobile performance CSS could be improved: {passed_checks}/5 optimizations")

    def validate_resource_optimization(self):
        """Validate resource optimization for Core Web Vitals"""
        print("\nValidating Resource Optimization...")
        
        # Test 1: Image optimization
        self.test_image_optimization()
        
        # Test 2: JavaScript optimization
        self.test_javascript_resource_optimization()
        
        # Test 3: CSS optimization
        self.test_css_optimization()
        
        # Test 4: Resource compression and caching
        self.test_resource_compression()

    def test_image_optimization(self):
        """Test image optimization implementation"""
        responsive_image = self.site_root / "layouts/partials/responsive-featured-image.html"
        
        if not responsive_image.exists():
            self.add_result("RESOURCE_IMAGE_OPT", "FAIL", "Responsive image partial not found")
            return
            
        content = responsive_image.read_text(encoding='utf-8')
        
        image_opt_checks = [
            r'fetchpriority="high"',
            r'loading="eager".*critical',
            r'w=414.*mobile',
            r'fm=webp',
            r'q=85.*quality'
        ]
        
        passed_checks = sum(1 for pattern in image_opt_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("RESOURCE_IMAGE_OPT", "PASS", 
                           f"Image optimization implemented: {passed_checks}/5 optimizations")
        else:
            self.add_result("RESOURCE_IMAGE_OPT", "WARNING", 
                           f"Image optimization could be improved: {passed_checks}/5 optimizations")

    def test_javascript_resource_optimization(self):
        """Test JavaScript resource optimization"""
        extend_head = self.site_root / "layouts/partials/extend_head.html"
        content = extend_head.read_text(encoding='utf-8')
        
        js_resource_checks = [
            r'resources\.Minify',
            r'fingerprint',
            r'integrity=',
            r'defer.*crossorigin',
            r'async.*non-critical'
        ]
        
        passed_checks = sum(1 for pattern in js_resource_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("RESOURCE_JS_OPT", "PASS", 
                           f"JavaScript resource optimization implemented: {passed_checks}/5 features")
        else:
            self.add_result("RESOURCE_JS_OPT", "WARNING", 
                           f"JavaScript optimization could be improved: {passed_checks}/5 features")

    def test_css_optimization(self):
        """Test CSS optimization"""
        extend_head = self.site_root / "layouts/partials/extend_head.html"
        content = extend_head.read_text(encoding='utf-8')
        
        css_opt_checks = [
            r'critical.*css.*inline',
            r'preload.*stylesheet.*onload',
            r'resources\.Concat',
            r'resources\.Minify.*css',
            r'media=.*max-width.*preload'
        ]
        
        passed_checks = sum(1 for pattern in css_opt_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 4:
            self.add_result("RESOURCE_CSS_OPT", "PASS", 
                           f"CSS optimization implemented: {passed_checks}/5 techniques")
        else:
            self.add_result("RESOURCE_CSS_OPT", "WARNING", 
                           f"CSS optimization could be enhanced: {passed_checks}/5 techniques")

    def test_resource_compression(self):
        """Test resource compression and caching"""
        extend_head = self.site_root / "layouts/partials/extend_head.html"
        content = extend_head.read_text(encoding='utf-8')
        
        compression_checks = [
            r'gzip.*compression',
            r'cache-control',
            r'max-age.*3600',
            r'stale-while-revalidate',
            r'crossorigin.*anonymous'
        ]
        
        passed_checks = sum(1 for pattern in compression_checks 
                           if re.search(pattern, content, re.IGNORECASE))
        
        if passed_checks >= 3:
            self.add_result("RESOURCE_COMPRESSION", "PASS", 
                           f"Resource compression implemented: {passed_checks}/5 features")
        else:
            self.add_result("RESOURCE_COMPRESSION", "WARNING", 
                           f"Resource compression could be improved: {passed_checks}/5 features")

    def add_result(self, test_id: str, status: str, details: str):
        """Add test result"""
        self.results.append({
            "id": test_id,
            "description": self.get_test_description(test_id),
            "status": status,
            "details": details,
            "timestamp": time.time()
        })
        
        # Print result
        status_symbol = {"PASS": "[PASS]", "FAIL": "[FAIL]", "WARNING": "[WARN]"}
        print(f"  {status_symbol.get(status, '[????]')} {test_id}: {status} - {details}")

    def get_test_description(self, test_id: str) -> str:
        """Get human-readable test description"""
        descriptions = {
            "LCP_HERO_PRELOAD": "Hero image preloading for LCP optimization",
            "LCP_FONT_PRELOAD": "Critical font preloading implementation",
            "LCP_PRIORITY_HINTS": "Resource priority hints for LCP elements",
            "LCP_CRITICAL_CSS": "Critical CSS inlining for fast render",
            "LCP_ELEMENT_OPT": "LCP element optimization in JavaScript",
            "CLS_ASPECT_RATIO": "Aspect ratio implementation for CLS prevention",
            "CLS_LAYOUT_STABILITY": "Layout stability measures",
            "CLS_DYNAMIC_CONTENT": "Dynamic content CLS prevention",
            "CLS_FONT_LOADING": "Font loading CLS prevention",
            "FID_JS_OPTIMIZATION": "JavaScript optimization for FID",
            "FID_INPUT_HANDLING": "Input handling optimization",
            "FID_CODE_SPLITTING": "Code splitting implementation",
            "FID_LONG_TASK_PREVENTION": "Long task prevention techniques",
            "CWV_PERFORMANCE_OBSERVER": "Performance Observer API implementation",
            "CWV_REAL_USER_MONITORING": "Real User Monitoring system",
            "CWV_ANALYTICS_INTEGRATION": "Analytics integration for Core Web Vitals",
            "CWV_MOBILE_MONITORING": "Mobile-specific monitoring features",
            "BUDGET_THRESHOLDS": "Performance budget thresholds definition",
            "BUDGET_MONITORING": "Budget monitoring implementation",
            "BUDGET_VIOLATION_DETECTION": "Violation detection and alerting",
            "BUDGET_MOBILE_ENFORCEMENT": "Mobile budget enforcement",
            "MOBILE_FIRST_DESIGN": "Mobile-first responsive design",
            "MOBILE_TOUCH_OPTIMIZATION": "Touch interaction optimization",
            "MOBILE_CONNECTION_AWARE": "Connection-aware loading",
            "MOBILE_PERFORMANCE_CSS": "Mobile performance CSS optimizations",
            "RESOURCE_IMAGE_OPT": "Image resource optimization",
            "RESOURCE_JS_OPT": "JavaScript resource optimization",
            "RESOURCE_CSS_OPT": "CSS resource optimization",
            "RESOURCE_COMPRESSION": "Resource compression and caching"
        }
        return descriptions.get(test_id, test_id)

    def generate_validation_report(self) -> Dict[str, Any]:
        """Generate comprehensive validation report"""
        print("\n" + "=" * 70)
        print("CORE WEB VITALS VALIDATION REPORT")
        print("=" * 70)
        
        # Calculate summary statistics
        total_tests = len(self.results)
        passed_tests = len([r for r in self.results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.results if r["status"] == "FAIL"])
        warning_tests = len([r for r in self.results if r["status"] == "WARNING"])
        
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        summary = {
            "timestamp": self.validation_timestamp,
            "total_tests": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "warnings": warning_tests,
            "success_rate": round(success_rate, 1),
            "mobile_ready": success_rate >= 85,
            "cwv_optimized": failed_tests == 0
        }
        
        # Print summary
        print(f"\nSUMMARY:")
        print(f"  Total Tests: {total_tests}")
        print(f"  Passed: {passed_tests}")
        print(f"  Failed: {failed_tests}")
        print(f"  Warnings: {warning_tests}")
        print(f"  Success Rate: {success_rate:.1f}%")
        print(f"  Mobile Ready: {'Yes' if summary['mobile_ready'] else 'No'}")
        print(f"  CWV Optimized: {'Yes' if summary['cwv_optimized'] else 'No'}")
        
        # Core Web Vitals assessment
        print(f"\nCORE WEB VITALS ASSESSMENT:")
        
        lcp_tests = [r for r in self.results if r["id"].startswith("LCP_")]
        cls_tests = [r for r in self.results if r["id"].startswith("CLS_")]
        fid_tests = [r for r in self.results if r["id"].startswith("FID_")]
        
        lcp_score = len([r for r in lcp_tests if r["status"] == "PASS"]) / len(lcp_tests) * 100
        cls_score = len([r for r in cls_tests if r["status"] == "PASS"]) / len(cls_tests) * 100
        fid_score = len([r for r in fid_tests if r["status"] == "PASS"]) / len(fid_tests) * 100
        
        print(f"  LCP Optimization: {lcp_score:.0f}% ({len([r for r in lcp_tests if r['status'] == 'PASS'])}/{len(lcp_tests)} tests passed)")
        print(f"  CLS Prevention: {cls_score:.0f}% ({len([r for r in cls_tests if r['status'] == 'PASS'])}/{len(cls_tests)} tests passed)")
        print(f"  FID Optimization: {fid_score:.0f}% ({len([r for r in fid_tests if r['status'] == 'PASS'])}/{len(fid_tests)} tests passed)")
        
        # Failed tests
        if failed_tests > 0:
            print(f"\nFAILED TESTS:")
            for result in self.results:
                if result["status"] == "FAIL":
                    print(f"  - {result['id']}: {result['details']}")
        
        # Recommendations
        recommendations = self.generate_recommendations()
        if recommendations:
            print(f"\nRECOMMENDATIONS:")
            for i, rec in enumerate(recommendations, 1):
                print(f"  {i}. {rec}")
        
        # Overall grade
        if success_rate >= 95:
            grade = "A+ (Excellent)"
        elif success_rate >= 90:
            grade = "A (Very Good)"
        elif success_rate >= 85:
            grade = "B+ (Good)"
        elif success_rate >= 80:
            grade = "B (Fair)"
        elif success_rate >= 70:
            grade = "C (Needs Improvement)"
        else:
            grade = "D (Poor)"
        
        print(f"\nOVERALL GRADE: {grade}")
        print(f"MOBILE PERFORMANCE: {'Ready for Production' if summary['mobile_ready'] else 'Needs Optimization'}")
        
        # Create full report
        report = {
            "summary": summary,
            "cwv_scores": {
                "lcp": lcp_score,
                "cls": cls_score,
                "fid": fid_score
            },
            "tests": self.results,
            "recommendations": recommendations,
            "grade": grade,
            "thresholds": self.cwv_thresholds,
            "mobile_budgets": self.mobile_budgets
        }
        
        # Save report to file
        self.save_report(report)
        
        print(f"\nReport saved to: CORE_WEB_VITALS_VALIDATION.json")
        print("=" * 70)
        
        return report

    def generate_recommendations(self) -> List[str]:
        """Generate recommendations based on test results"""
        recommendations = []
        
        failed_tests = [r for r in self.results if r["status"] == "FAIL"]
        warning_tests = [r for r in self.results if r["status"] == "WARNING"]
        
        # LCP recommendations
        lcp_failures = [r for r in failed_tests if r["id"].startswith("LCP_")]
        if lcp_failures:
            recommendations.append("Improve Largest Contentful Paint (LCP): Optimize hero image preloading, implement critical font loading, and prioritize above-the-fold content.")
        
        # CLS recommendations
        cls_failures = [r for r in failed_tests if r["id"].startswith("CLS_")]
        if cls_failures:
            recommendations.append("Reduce Cumulative Layout Shift (CLS): Add aspect ratios to images, reserve space for dynamic content, and implement skeleton loading states.")
        
        # FID recommendations
        fid_failures = [r for r in failed_tests if r["id"].startswith("FID_")]
        if fid_failures:
            recommendations.append("Optimize First Input Delay (FID): Implement code splitting, defer non-critical JavaScript, and optimize input event handling.")
        
        # Budget recommendations
        budget_failures = [r for r in failed_tests if r["id"].startswith("BUDGET_")]
        if budget_failures:
            recommendations.append("Implement performance budgets: Set up mobile-specific resource budgets and violation monitoring to maintain optimal performance.")
        
        # Mobile recommendations
        mobile_failures = [r for r in failed_tests if r["id"].startswith("MOBILE_")]
        if mobile_failures:
            recommendations.append("Enhance mobile optimization: Improve touch targets, implement connection-aware loading, and optimize for mobile-first performance.")
        
        # Resource recommendations
        resource_warnings = [r for r in warning_tests if r["id"].startswith("RESOURCE_")]
        if resource_warnings:
            recommendations.append("Optimize resource loading: Implement better compression, improve caching strategies, and optimize critical resource prioritization.")
        
        return recommendations

    def save_report(self, report: Dict[str, Any]):
        """Save validation report to JSON file"""
        report_file = self.site_root / "CORE_WEB_VITALS_VALIDATION.json"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

def main():
    """Main validation function"""
    site_root = os.getcwd()
    
    validator = CoreWebVitalsValidator(site_root)
    report = validator.run_validation()
    
    # Exit with appropriate code
    if report["summary"]["cwv_optimized"] and report["summary"]["mobile_ready"]:
        print("\nCore Web Vitals optimization validation PASSED!")
        exit(0)
    elif report["summary"]["success_rate"] >= 85:
        print("\nCore Web Vitals optimization validation completed with warnings.")
        exit(0)
    else:
        print("\nCore Web Vitals optimization validation FAILED!")
        exit(1)

if __name__ == "__main__":
    main()