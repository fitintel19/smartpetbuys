#!/usr/bin/env node
// SmartPetBuys Mobile Testing - Comprehensive Test Execution Script
// Executes all mobile tests across device matrix and generates reports

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MobileTestRunner {
  constructor() {
    this.results = {
      smoke: null,
      critical: null,
      performance: null,
      accessibility: null,
      visual: null,
      deviceMatrix: null
    };
    this.startTime = Date.now();
  }

  async runTestSuite(name, command, description) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 ${description}`);
    console.log(`${'='.repeat(60)}`);
    
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const process = spawn('npx', command.split(' ').slice(1), {
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
      });
      
      process.on('close', (code) => {
        const duration = Date.now() - startTime;
        const success = code === 0;
        
        this.results[name] = {
          success,
          duration,
          command,
          exitCode: code
        };
        
        console.log(`\n${success ? '✅' : '❌'} ${description} completed in ${(duration/1000).toFixed(1)}s`);
        resolve(success);
      });
      
      process.on('error', (error) => {
        console.error(`❌ Error running ${name}:`, error.message);
        this.results[name] = {
          success: false,
          duration: Date.now() - startTime,
          command,
          error: error.message
        };
        resolve(false);
      });
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Mobile Testing Suite');
    console.log(`📅 ${new Date().toISOString()}`);
    
    // 1. Smoke Tests - Quick validation
    await this.runTestSuite(
      'smoke',
      'npx playwright test tests/smoke --project=iPhone-15-Pro-Safari --timeout=30000',
      'Smoke Tests - Basic Functionality Validation'
    );

    // 2. Critical Tests - Core mobile functionality
    await this.runTestSuite(
      'critical',
      'npx playwright test tests/critical --project=iPhone-15-Pro-Safari --project=Samsung-Galaxy-S24-Chrome --timeout=60000',
      'Critical Tests - Core Mobile Functionality'
    );

    // 3. Performance Tests - Core Web Vitals
    if (this.results.critical.success) {
      await this.runTestSuite(
        'performance',
        'npx playwright test tests/performance --config=playwright.performance.config.js --timeout=120000',
        'Performance Tests - Core Web Vitals Validation'
      );
    } else {
      console.log('⏭️ Skipping performance tests due to critical test failures');
    }

    // 4. Accessibility Tests
    if (this.results.smoke.success) {
      await this.runTestSuite(
        'accessibility',
        'npx playwright test tests/accessibility --config=playwright.accessibility.config.js --project=A11y-iPhone-15-Pro-VoiceOver --timeout=90000',
        'Accessibility Tests - WCAG Compliance Validation'
      );
    } else {
      console.log('⏭️ Skipping accessibility tests due to smoke test failures');
    }

    // 5. Visual Regression Tests (subset)
    if (this.results.critical.success) {
      await this.runTestSuite(
        'visual',
        'npx playwright test tests/visual --config=playwright.visual.config.js --project=Visual-iPhone-15-Pro --project=Visual-Samsung-Galaxy-S24 --timeout=90000',
        'Visual Regression Tests - UI Consistency Validation'
      );
    } else {
      console.log('⏭️ Skipping visual tests due to critical test failures');
    }

    // 6. Device Matrix Tests (Tier 1 devices only)
    if (this.results.smoke.success && this.results.critical.success) {
      await this.runTestSuite(
        'deviceMatrix',
        'npx playwright test tests/critical tests/smoke --config=playwright.device-matrix.config.js --timeout=90000',
        'Device Matrix Tests - Cross-Device Validation'
      );
    } else {
      console.log('⏭️ Skipping device matrix tests due to prerequisite failures');
    }

    await this.generateReport();
  }

  async generateReport() {
    const totalDuration = Date.now() - this.startTime;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 COMPREHENSIVE MOBILE TESTING SUMMARY');
    console.log(`${'='.repeat(80)}`);
    
    const testSuites = [
      { name: 'smoke', title: 'Smoke Tests', critical: true },
      { name: 'critical', title: 'Critical Tests', critical: true },
      { name: 'performance', title: 'Performance Tests', critical: false },
      { name: 'accessibility', title: 'Accessibility Tests', critical: false },
      { name: 'visual', title: 'Visual Regression Tests', critical: false },
      { name: 'deviceMatrix', title: 'Device Matrix Tests', critical: false }
    ];
    
    let criticalPassed = 0;
    let criticalTotal = 0;
    let overallPassed = 0;
    let overallTotal = 0;
    
    console.log('\n🧪 Test Suite Results:');
    testSuites.forEach(({ name, title, critical }) => {
      const result = this.results[name];
      
      if (result) {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        const duration = `${(result.duration/1000).toFixed(1)}s`;
        console.log(`   ${status} ${title.padEnd(30)} ${duration}`);
        
        if (critical) {
          criticalTotal++;
          if (result.success) criticalPassed++;
        }
        
        overallTotal++;
        if (result.success) overallPassed++;
      } else {
        console.log(`   ⏭️ SKIP ${title.padEnd(30)} (not run)`);
        if (critical) criticalTotal++;
        overallTotal++;
      }
    });
    
    console.log(`\n📈 Success Rates:`);
    console.log(`   Critical Tests: ${criticalPassed}/${criticalTotal} (${((criticalPassed/criticalTotal)*100).toFixed(1)}%)`);
    console.log(`   Overall Tests:  ${overallPassed}/${overallTotal} (${((overallPassed/overallTotal)*100).toFixed(1)}%)`);
    console.log(`   Total Duration: ${(totalDuration/1000/60).toFixed(1)} minutes`);
    
    // Mobile optimization status
    console.log(`\n📱 Mobile Optimization Status:`);
    if (criticalPassed === criticalTotal) {
      console.log(`   ✅ Mobile optimization is working correctly`);
      console.log(`   ✅ Core functionality passes across devices`);
    } else {
      console.log(`   ❌ Mobile optimization needs attention`);
      console.log(`   ❌ ${criticalTotal - criticalPassed} critical issue(s) found`);
    }
    
    // Performance insights
    if (this.results.performance?.success) {
      console.log(`   ✅ Core Web Vitals optimization validated`);
    } else if (this.results.performance) {
      console.log(`   ⚠️ Performance optimization needs review`);
    }
    
    // Accessibility insights
    if (this.results.accessibility?.success) {
      console.log(`   ✅ WCAG accessibility compliance validated`);
    } else if (this.results.accessibility) {
      console.log(`   ⚠️ Accessibility compliance needs review`);
    }
    
    // Device compatibility
    if (this.results.deviceMatrix?.success) {
      console.log(`   ✅ Cross-device compatibility validated`);
    } else if (this.results.deviceMatrix) {
      console.log(`   ⚠️ Device compatibility needs review`);
    }
    
    // Next steps
    console.log(`\n🎯 Next Steps:`);
    if (criticalPassed < criticalTotal) {
      console.log(`   1. Fix critical mobile functionality issues`);
      console.log(`   2. Re-run critical tests to validate fixes`);
      console.log(`   3. Proceed with comprehensive testing`);
    } else {
      console.log(`   1. Review performance test results if available`);
      console.log(`   2. Address any accessibility issues found`);
      console.log(`   3. Set up continuous integration for mobile testing`);
    }
    
    // Save detailed report
    const reportData = {
      summary: {
        totalDuration,
        criticalPassed,
        criticalTotal,
        overallPassed,
        overallTotal,
        timestamp: new Date().toISOString()
      },
      results: this.results,
      testSuites,
      recommendations: this.generateRecommendations()
    };
    
    const reportsDir = path.join(__dirname, 'test-results', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(reportsDir, 'comprehensive-test-report.json'),
      JSON.stringify(reportData, null, 2)
    );
    
    console.log(`\n📄 Detailed report saved to: test-results/reports/comprehensive-test-report.json`);
    console.log(`${'='.repeat(80)}`);
    
    return criticalPassed === criticalTotal;
  }
  
  generateRecommendations() {
    const recommendations = [];
    
    if (!this.results.smoke?.success) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Basic Functionality',
        issue: 'Smoke tests failed',
        action: 'Fix basic site functionality before proceeding with mobile optimization'
      });
    }
    
    if (!this.results.critical?.success) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Mobile Navigation',
        issue: 'Critical mobile tests failed',
        action: 'Review mobile navigation and responsive layout issues'
      });
    }
    
    if (!this.results.performance?.success && this.results.performance) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Performance',
        issue: 'Performance tests failed',
        action: 'Optimize Core Web Vitals and loading performance'
      });
    }
    
    if (!this.results.accessibility?.success && this.results.accessibility) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Accessibility',
        issue: 'Accessibility tests failed',
        action: 'Improve WCAG compliance and mobile accessibility'
      });
    }
    
    return recommendations;
  }
}

// Run the comprehensive test suite
if (require.main === module) {
  const runner = new MobileTestRunner();
  runner.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = MobileTestRunner;