// SmartPetBuys Mobile Testing - Device Matrix Reporter
// Custom reporter for device matrix testing results

class DeviceMatrixReporter {
  constructor(options = {}) {
    this.options = options;
    this.results = new Map();
    this.startTime = null;
    this.endTime = null;
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
    console.log(`🚀 Starting Device Matrix Testing with ${suite.allTests().length} tests`);
    console.log(`📱 Testing across ${config.projects.length} device configurations`);
  }

  onTestBegin(test, result) {
    const deviceName = test.parent.project()?.name || 'unknown';
    console.log(`📱 [${deviceName}] Starting: ${test.title}`);
  }

  onTestEnd(test, result) {
    const deviceName = test.parent.project()?.name || 'unknown';
    const status = result.status;
    const duration = result.duration;
    
    if (!this.results.has(deviceName)) {
      this.results.set(deviceName, {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0,
        tests: []
      });
    }
    
    const deviceResults = this.results.get(deviceName);
    deviceResults.total++;
    deviceResults[status]++;
    
    deviceResults.tests.push({
      title: test.title,
      status,
      duration,
      errors: result.errors.map(e => e.message)
    });
    
    const statusIcon = {
      'passed': '✅',
      'failed': '❌',
      'skipped': '⏭️',
      'timedOut': '⏱️'
    }[status] || '❓';
    
    console.log(`${statusIcon} [${deviceName}] ${test.title} (${duration}ms)`);
    
    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        console.log(`   Error: ${error.message}`);
      });
    }
  }

  onEnd(result) {
    this.endTime = Date.now();
    const duration = this.endTime - this.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 DEVICE MATRIX TESTING SUMMARY');
    console.log('='.repeat(80));
    
    // Overall statistics
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalTests = 0;
    
    this.results.forEach((deviceResult, deviceName) => {
      totalPassed += deviceResult.passed;
      totalFailed += deviceResult.failed;
      totalSkipped += deviceResult.skipped;
      totalTests += deviceResult.total;
    });
    
    console.log(`\n📈 Overall Results:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${totalPassed} (${((totalPassed/totalTests)*100).toFixed(1)}%)`);
    console.log(`   Failed: ${totalFailed} (${((totalFailed/totalTests)*100).toFixed(1)}%)`);
    console.log(`   Skipped: ${totalSkipped} (${((totalSkipped/totalTests)*100).toFixed(1)}%)`);
    console.log(`   Duration: ${(duration/1000).toFixed(2)}s`);
    
    // Device-specific results
    console.log(`\n📱 Device Results:`);
    this.results.forEach((deviceResult, deviceName) => {
      const successRate = ((deviceResult.passed / deviceResult.total) * 100).toFixed(1);
      const statusIcon = deviceResult.failed === 0 ? '✅' : '❌';
      
      console.log(`   ${statusIcon} ${deviceName}: ${deviceResult.passed}/${deviceResult.total} (${successRate}%)`);
      
      if (deviceResult.failed > 0) {
        deviceResult.tests
          .filter(test => test.status === 'failed')
          .forEach(test => {
            console.log(`      ❌ ${test.title}`);
            test.errors.forEach(error => {
              console.log(`         ${error}`);
            });
          });
      }
    });
    
    // Critical device analysis
    console.log(`\n🎯 Critical Device Analysis:`);
    const criticalDevices = [
      'iPhone-15-Pro-Safari',
      'iPhone-SE-Safari', 
      'Samsung-Galaxy-S24-Chrome',
      'iPad-Pro-Safari'
    ];
    
    criticalDevices.forEach(deviceName => {
      const deviceResult = this.results.get(deviceName);
      if (deviceResult) {
        const successRate = ((deviceResult.passed / deviceResult.total) * 100).toFixed(1);
        const status = deviceResult.failed === 0 ? '✅ PASS' : '❌ FAIL';
        console.log(`   ${status} ${deviceName}: ${successRate}% success rate`);
      } else {
        console.log(`   ⚠️ ${deviceName}: No test results`);
      }
    });
    
    // Performance insights
    console.log(`\n⚡ Performance Insights:`);
    const performanceTests = [];
    this.results.forEach((deviceResult, deviceName) => {
      deviceResult.tests.forEach(test => {
        if (test.title.includes('performance') || test.title.includes('Core Web Vitals')) {
          performanceTests.push({
            device: deviceName,
            test: test.title,
            duration: test.duration,
            status: test.status
          });
        }
      });
    });
    
    if (performanceTests.length > 0) {
      const avgDuration = performanceTests.reduce((sum, test) => sum + test.duration, 0) / performanceTests.length;
      console.log(`   Average performance test duration: ${avgDuration.toFixed(0)}ms`);
      
      const failedPerformance = performanceTests.filter(test => test.status === 'failed');
      if (failedPerformance.length > 0) {
        console.log(`   ⚠️ ${failedPerformance.length} performance test(s) failed`);
      }
    }
    
    // Mobile-specific issues
    console.log(`\n📱 Mobile-Specific Issues:`);
    const mobileIssues = [];
    this.results.forEach((deviceResult, deviceName) => {
      if (deviceName.includes('mobile') || deviceName.includes('iPhone') || deviceName.includes('Samsung')) {
        const failedTests = deviceResult.tests.filter(test => test.status === 'failed');
        failedTests.forEach(test => {
          mobileIssues.push({
            device: deviceName,
            test: test.title,
            errors: test.errors
          });
        });
      }
    });
    
    if (mobileIssues.length > 0) {
      console.log(`   Found ${mobileIssues.length} mobile-specific issue(s)`);
      mobileIssues.slice(0, 5).forEach(issue => {
        console.log(`   - ${issue.device}: ${issue.test}`);
      });
    } else {
      console.log(`   ✅ No mobile-specific issues detected`);
    }
    
    // Generate JSON report
    const reportData = {
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        totalSkipped,
        duration,
        successRate: ((totalPassed/totalTests)*100).toFixed(1)
      },
      devices: Object.fromEntries(this.results),
      criticalDevices: criticalDevices.map(deviceName => ({
        name: deviceName,
        result: this.results.get(deviceName) || null
      })),
      performanceTests,
      mobileIssues,
      timestamp: new Date().toISOString()
    };
    
    // Save detailed report
    const fs = require('fs');
    const path = require('path');
    
    const reportDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(reportDir, 'device-matrix-report.json'),
      JSON.stringify(reportData, null, 2)
    );
    
    console.log(`\n📄 Detailed report saved to: test-results/device-matrix-report.json`);
    
    // Final summary
    if (totalFailed === 0) {
      console.log(`\n🎉 All device matrix tests passed!`);
    } else {
      console.log(`\n⚠️ ${totalFailed} test(s) failed across devices`);
    }
    
    console.log('='.repeat(80));
  }
}

module.exports = DeviceMatrixReporter;