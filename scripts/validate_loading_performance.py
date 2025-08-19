#!/usr/bin/env python3
"""
Mobile Loading Performance Validation Script for SmartPetBuys
Tests mobile-first loading strategies, performance optimizations, and Core Web Vitals
Version: 1.0
"""

import json
import time
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Any
import re

class LoadingPerformanceValidator:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.results = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'tests': [],
            'summary': {
                'total_tests': 0,
                'passed': 0,
                'failed': 0,
                'warnings': 0
            }
        }
        
    def run_all_tests(self):
        """Run comprehensive loading performance validation"""
        print("Starting Mobile Loading Performance Validation...")
        print("=" * 60)
        
        # Test categories
        test_categories = [
            ('Critical CSS Implementation', self.test_critical_css),
            ('Font Loading Optimization', self.test_font_loading),
            ('Resource Hints Configuration', self.test_resource_hints),
            ('Lazy Loading Implementation', self.test_lazy_loading),
            ('JavaScript Loading Strategy', self.test_javascript_loading),
            ('Service Worker Integration', self.test_service_worker),
            ('Connection-Aware Loading', self.test_connection_aware),
            ('Performance Monitoring', self.test_performance_monitoring),
            ('Mobile-First Optimizations', self.test_mobile_optimizations)
        ]
        
        for category_name, test_function in test_categories:
            print(f"\nTesting: {category_name}")
            print("-" * 40)
            test_function()
            
        self.generate_report()
        return self.results['summary']['failed'] == 0

    def test_critical_css(self):
        """Test critical CSS implementation"""
        # Check critical CSS file exists
        critical_css_path = self.project_root / 'assets/css/extended/critical.css'
        self.assert_file_exists(
            critical_css_path,
            "Critical CSS file should exist",
            "CRITICAL_CSS_EXISTS"
        )
        
        if critical_css_path.exists():
            content = critical_css_path.read_text(encoding='utf-8')
            
            # Check for essential critical styles
            critical_checks = [
                ('CSS Variables', ':root {', 'CSS custom properties defined'),
                ('Essential Reset', '*,*::before,*::after', 'Box-sizing reset present'),
                ('Body Styles', 'body {', 'Body base styles defined'),
                ('Header Styles', '.header {', 'Header styles for above-the-fold'),
                ('Navigation', '.nav {', 'Navigation styles for critical render'),
                ('Typography', 'h1,h2,h3', 'Essential typography styles'),
                ('Mobile-First', '@media (max-width: 768px)', 'Mobile-first responsive design')
            ]
            
            for name, pattern, description in critical_checks:
                self.assert_content_contains(
                    content, pattern, description, f"CRITICAL_CSS_{name.upper().replace(' ', '_')}"
                )

    def test_font_loading(self):
        """Test font loading optimization"""
        extend_head_path = self.project_root / 'layouts/partials/extend_head.html'
        self.assert_file_exists(
            extend_head_path,
            "Extend head template should exist",
            "FONT_TEMPLATE_EXISTS"
        )
        
        if extend_head_path.exists():
            content = extend_head_path.read_text(encoding='utf-8')
            
            font_checks = [
                ('Preconnect', 'rel="preconnect" href="https://fonts.googleapis.com"', 'Font preconnect implemented'),
                ('DNS Prefetch', 'rel="dns-prefetch" href="https://fonts.googleapis.com"', 'Font DNS prefetch present'),
                ('Font Display', 'display=swap', 'Font-display swap strategy used'),
                ('Progressive Loading', 'document.fonts.load', 'Progressive font loading script'),
                ('Fallback Fonts', 'font-family: system-ui', 'System font fallbacks defined'),
                ('Font Loading Classes', 'montserrat-600-loaded', 'Font loading state classes')
            ]
            
            for name, pattern, description in font_checks:
                self.assert_content_contains(
                    content, pattern, description, f"FONT_{name.upper().replace(' ', '_')}"
                )

    def test_resource_hints(self):
        """Test resource hints implementation"""
        extend_head_path = self.project_root / 'layouts/partials/extend_head.html'
        
        if extend_head_path.exists():
            content = extend_head_path.read_text(encoding='utf-8')
            
            hint_checks = [
                ('Preconnect GTM', 'preconnect" href="https://www.googletagmanager.com"', 'Google Tag Manager preconnect'),
                ('Preconnect MailerLite', 'preconnect" href="https://assets.mailerlite.com"', 'MailerLite preconnect'),
                ('DNS Prefetch Analytics', 'dns-prefetch" href="https://www.google-analytics.com"', 'Analytics DNS prefetch'),
                ('Module Preload', 'rel="modulepreload"', 'JavaScript module preloading'),
                ('Connection Aware', 'navigator.connection', 'Connection-aware loading logic'),
                ('Cache Control', 'Cache-Control', 'Advanced caching headers')
            ]
            
            for name, pattern, description in hint_checks:
                self.assert_content_contains(
                    content, pattern, description, f"RESOURCE_HINT_{name.upper().replace(' ', '_')}"
                )

    def test_lazy_loading(self):
        """Test lazy loading implementation"""
        # Check performance loader
        perf_loader_path = self.project_root / 'assets/js/performance-loader.js'
        self.assert_file_exists(
            perf_loader_path,
            "Performance loader script should exist",
            "LAZY_LOADING_SCRIPT"
        )
        
        if perf_loader_path.exists():
            content = perf_loader_path.read_text(encoding='utf-8')
            
            lazy_checks = [
                ('Intersection Observer', 'IntersectionObserver', 'Modern lazy loading API used'),
                ('Image Lazy Loading', 'lazyLoadImages', 'Image lazy loading function'),
                ('Iframe Lazy Loading', 'lazyLoadIframes', 'Iframe lazy loading function'),
                ('Connection Aware', 'getConnectionInfo', 'Connection-aware loading'),
                ('Fallback Support', 'loadAllImagesImmediately', 'Fallback for unsupported browsers'),
                ('Performance Monitoring', 'setupPerformanceMonitoring', 'Performance tracking integrated')
            ]
            
            for name, pattern, description in lazy_checks:
                self.assert_content_contains(
                    content, pattern, description, f"LAZY_{name.upper().replace(' ', '_')}"
                )
        
        # Check performance loading CSS
        perf_css_path = self.project_root / 'assets/css/extended/performance-loading.css'
        self.assert_file_exists(
            perf_css_path,
            "Performance loading CSS should exist",
            "LAZY_LOADING_CSS"
        )

    def test_javascript_loading(self):
        """Test JavaScript loading strategy"""
        extend_head_path = self.project_root / 'layouts/partials/extend_head.html'
        
        if extend_head_path.exists():
            content = extend_head_path.read_text(encoding='utf-8')
            
            js_checks = [
                ('Defer Loading', 'defer', 'JavaScript files loaded with defer'),
                ('Async Analytics', 'async=1', 'Analytics loaded asynchronously'),
                ('User Interaction', 'addEventListener(event, loadGA', 'GA loaded on interaction'),
                ('Progressive Enhancement', 'if (\'fonts\' in document)', 'Progressive enhancement pattern'),
                ('Module Support', 'modulepreload', 'Modern module loading support'),
                ('Integrity Hashes', 'integrity="', 'Subresource integrity verification')
            ]
            
            for name, pattern, description in js_checks:
                self.assert_content_contains(
                    content, pattern, description, f"JS_{name.upper().replace(' ', '_')}"
                )

    def test_service_worker(self):
        """Test service worker implementation"""
        # Check service worker file
        sw_path = self.project_root / 'static/sw.js'
        self.assert_file_exists(
            sw_path,
            "Service worker file should exist",
            "SERVICE_WORKER_FILE"
        )
        
        if sw_path.exists():
            content = sw_path.read_text(encoding='utf-8')
            
            sw_checks = [
                ('Cache Strategies', 'CACHE_STRATEGIES', 'Multiple caching strategies defined'),
                ('Offline Support', 'offline.html', 'Offline page support'),
                ('Cache First', 'cacheFirst', 'Cache-first strategy for static assets'),
                ('Network First', 'networkFirst', 'Network-first for dynamic content'),
                ('Background Sync', 'background-sync', 'Background sync capability'),
                ('Push Notifications', 'addEventListener(\'push\'', 'Push notification support')
            ]
            
            for name, pattern, description in sw_checks:
                self.assert_content_contains(
                    content, pattern, description, f"SW_{name.upper().replace(' ', '_')}"
                )
        
        # Check service worker registration
        sw_register_path = self.project_root / 'assets/js/sw-register.js'
        self.assert_file_exists(
            sw_register_path,
            "Service worker registration should exist",
            "SW_REGISTRATION"
        )
        
        # Check offline page
        offline_page_path = self.project_root / 'content/offline.md'
        self.assert_file_exists(
            offline_page_path,
            "Offline page should exist",
            "OFFLINE_PAGE"
        )

    def test_connection_aware(self):
        """Test connection-aware loading"""
        perf_loader_path = self.project_root / 'assets/js/performance-loader.js'
        
        if perf_loader_path.exists():
            content = perf_loader_path.read_text(encoding='utf-8')
            
            connection_checks = [
                ('Connection Detection', 'navigator.connection', 'Network connection detection'),
                ('Effective Type', 'effectiveType', 'Connection type awareness'),
                ('Save Data', 'saveData', 'Data saver mode detection'),
                ('Slow Connection', 'isSlowConnection', 'Slow connection handling'),
                ('Adaptive Loading', 'setupConnectionAwareLoading', 'Adaptive loading strategy'),
                ('Reduced Animations', 'disableNonEssentialAnimations', 'Animation reduction for slow connections')
            ]
            
            for name, pattern, description in connection_checks:
                self.assert_content_contains(
                    content, pattern, description, f"CONNECTION_{name.upper().replace(' ', '_')}"
                )

    def test_performance_monitoring(self):
        """Test performance monitoring implementation"""
        monitor_path = self.project_root / 'assets/js/performance-monitor.js'
        self.assert_file_exists(
            monitor_path,
            "Performance monitor script should exist",
            "PERFORMANCE_MONITOR"
        )
        
        if monitor_path.exists():
            content = monitor_path.read_text(encoding='utf-8')
            
            monitor_checks = [
                ('Core Web Vitals', 'setupCoreWebVitalsMonitoring', 'Core Web Vitals tracking'),
                ('LCP Monitoring', 'largest-contentful-paint', 'Largest Contentful Paint tracking'),
                ('FID Monitoring', 'first-input', 'First Input Delay tracking'),
                ('CLS Monitoring', 'layout-shift', 'Cumulative Layout Shift tracking'),
                ('Resource Timing', 'setupResourceTimingMonitoring', 'Resource performance tracking'),
                ('Error Monitoring', 'setupErrorMonitoring', 'Error tracking implementation'),
                ('Mobile Specific', 'setupMobileSpecificMonitoring', 'Mobile-specific performance tracking')
            ]
            
            for name, pattern, description in monitor_checks:
                self.assert_content_contains(
                    content, pattern, description, f"MONITOR_{name.upper().replace(' ', '_')}"
                )

    def test_mobile_optimizations(self):
        """Test mobile-specific optimizations"""
        # Check mobile-first critical CSS
        critical_css_path = self.project_root / 'assets/css/extended/critical.css'
        
        if critical_css_path.exists():
            content = critical_css_path.read_text(encoding='utf-8')
            
            mobile_checks = [
                ('Mobile Media Query', '@media (max-width: 768px)', 'Mobile-first media queries'),
                ('Touch Targets', 'min-width: 44px', 'Minimum touch target sizes'),
                ('Viewport Units', 'vw', 'Responsive viewport units'),
                ('Mobile Menu', '.mobile-menu-toggle', 'Mobile navigation toggle'),
                ('Responsive Layout', 'flex', 'Flexible layout systems')
            ]
            
            for name, pattern, description in mobile_checks:
                self.assert_content_contains(
                    content, pattern, description, f"MOBILE_{name.upper().replace(' ', '_')}"
                )
        
        # Check performance loading CSS for mobile
        perf_css_path = self.project_root / 'assets/css/extended/performance-loading.css'
        
        if perf_css_path.exists():
            content = perf_css_path.read_text(encoding='utf-8')
            
            perf_mobile_checks = [
                ('Reduced Motion', 'prefers-reduced-motion', 'Respects reduced motion preference'),
                ('Touch Optimizations', 'hover: none', 'Touch-specific optimizations'),
                ('High Contrast', 'prefers-contrast: high', 'High contrast mode support'),
                ('Dark Mode', 'prefers-color-scheme: dark', 'Dark mode optimizations'),
                ('Mobile Performance', '@media (max-width: 768px)', 'Mobile-specific performance styles')
            ]
            
            for name, pattern, description in perf_mobile_checks:
                self.assert_content_contains(
                    content, pattern, description, f"PERF_MOBILE_{name.upper().replace(' ', '_')}"
                )

    def assert_file_exists(self, file_path: Path, description: str, test_id: str):
        """Assert that a file exists"""
        exists = file_path.exists()
        self.record_test_result(
            test_id=test_id,
            description=description,
            passed=exists,
            details=f"File: {file_path.relative_to(self.project_root)}"
        )
        
    def assert_content_contains(self, content: str, pattern: str, description: str, test_id: str):
        """Assert that content contains a pattern"""
        contains = pattern.lower() in content.lower()
        self.record_test_result(
            test_id=test_id,
            description=description,
            passed=contains,
            details=f"Pattern: {pattern}"
        )
        
    def record_test_result(self, test_id: str, description: str, passed: bool, details: str = "", warning: bool = False):
        """Record a test result"""
        status = "PASS" if passed else ("WARN" if warning else "FAIL")
        icon = "[PASS]" if passed else ("[WARN]" if warning else "[FAIL]")
        
        result = {
            'id': test_id,
            'description': description,
            'status': status,
            'details': details,
            'timestamp': time.time()
        }
        
        self.results['tests'].append(result)
        self.results['summary']['total_tests'] += 1
        
        if passed:
            self.results['summary']['passed'] += 1
        elif warning:
            self.results['summary']['warnings'] += 1
        else:
            self.results['summary']['failed'] += 1
            
        print(f"  {icon} {description}")
        if details and not passed:
            print(f"    Details: {details}")

    def generate_report(self):
        """Generate final validation report"""
        print("\n" + "=" * 60)
        print("MOBILE LOADING PERFORMANCE VALIDATION REPORT")
        print("=" * 60)
        
        summary = self.results['summary']
        total = summary['total_tests']
        passed = summary['passed']
        failed = summary['failed']
        warnings = summary['warnings']
        
        print(f"\nTest Summary:")
        print(f"  Total Tests: {total}")
        print(f"  [PASS] Passed: {passed} ({passed/total*100:.1f}%)")
        print(f"  [FAIL] Failed: {failed} ({failed/total*100:.1f}%)")
        print(f"  [WARN] Warnings: {warnings} ({warnings/total*100:.1f}%)")
        
        # Overall status
        if failed == 0:
            print(f"\nVALIDATION SUCCESSFUL!")
            print("All mobile loading performance optimizations are properly implemented.")
        else:
            print(f"\nVALIDATION FAILED!")
            print(f"Found {failed} issues that need to be addressed.")
            
            # Show failed tests
            print(f"\nFailed Tests:")
            for test in self.results['tests']:
                if test['status'] == 'FAIL':
                    print(f"  [FAIL] {test['description']} ({test['id']})")
                    if test['details']:
                        print(f"    {test['details']}")
        
        # Save detailed report
        report_path = self.project_root / 'MOBILE_LOADING_PERFORMANCE_VALIDATION.json'
        with open(report_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\nDetailed report saved to: {report_path.name}")
        
        # Performance recommendations
        self.print_performance_recommendations()

    def print_performance_recommendations(self):
        """Print performance optimization recommendations"""
        print(f"\nPERFORMANCE OPTIMIZATION RECOMMENDATIONS")
        print("-" * 50)
        
        recommendations = [
            "* Monitor Core Web Vitals regularly using the performance monitor",
            "* Test loading performance on actual mobile devices and slow networks",
            "* Enable service worker in production for offline capabilities",
            "* Use Google PageSpeed Insights to validate improvements",
            "* Monitor real user metrics (RUM) to track performance impact",
            "* Consider implementing a performance budget for assets",
            "* Optimize hero images with appropriate WebP formats and sizes",
            "* Test connection-aware loading on different network conditions",
            "* Regularly audit third-party scripts for performance impact",
            "* Set up performance monitoring alerts for regressions"
        ]
        
        for rec in recommendations:
            print(f"  {rec}")

def main():
    """Main execution function"""
    validator = LoadingPerformanceValidator()
    
    try:
        success = validator.run_all_tests()
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n\nValidation interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\nValidation failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()