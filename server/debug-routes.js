// Debug routes and find errors in routes
const fs = require('fs');
const path = require('path');

// Function to find suspicious router.get calls
function scanFile(filePath) {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Log file being scanned
    console.log(`\nScanning ${filePath}`);
    
    let inRouteDefinition = false;
    let braceCount = 0;
    let routeStartLine = 0;
    
    // Check for problematic patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Count braces to detect unclosed routes
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      
      if (line.includes('router.get') || line.includes('router.post') || 
          line.includes('router.put') || line.includes('router.delete')) {
        
        // Check if there's a route with incorrect format (missing callback)
        if (!line.includes('=>') && !line.includes('function') && line.endsWith(';')) {
          console.log(`[Line ${i + 1}] ERROR: Route without callback function: ${line}`);
        }
        
        // Check if route ends with a brace but no callback function
        if (line.endsWith('{') && !line.includes('=>') && !line.includes('function')) {
          console.log(`[Line ${i + 1}] ERROR: Route with object instead of callback: ${line}`);
        }
        
        // Track the start of a route definition
        if (!inRouteDefinition) {
          inRouteDefinition = true;
          routeStartLine = i + 1;
          braceCount = 0;
        }
      }
      
      // Track brace count
      if (inRouteDefinition) {
        braceCount += openBraces - closeBraces;
        
        // End of route definition
        if (braceCount === 0 && (openBraces > 0 || closeBraces > 0)) {
          inRouteDefinition = false;
        }
      }
      
      // Look for router.get with missing parentheses or quotes
      if (line.includes('router.get')) {
        if (!line.includes('(') || !line.includes(')')) {
          console.log(`[Line ${i + 1}] ERROR: Malformed route.get syntax (missing parentheses): ${line}`);
        }
        
        if (!line.includes('\'') && !line.includes('"') && !line.includes('`')) {
          console.log(`[Line ${i + 1}] ERROR: Missing path string in route: ${line}`);
        }
      }
      
      // Look for route.get instead of router.get (common typo)
      if (line.includes('route.get') && !line.includes('router.get')) {
        console.log(`[Line ${i + 1}] ERROR: Using 'route.get' instead of 'router.get': ${line}`);
      }
      
      // Look for router.get with { object literal } immediately following
      const routerGetWithObjectRegex = /router\.(get|post|put|delete)\s*\([^)]*\)\s*\{[^=]/;
      if (routerGetWithObjectRegex.test(line)) {
        console.log(`[Line ${i + 1}] ERROR: Router with object literal instead of callback: ${line}`);
      }
      
      // Check for module.exports issue at the end
      if (i === lines.length - 1 && line.includes('module.exports')) {
        // Check if it's exporting router correctly
        if (!line.includes('router') && !content.includes('module.exports = router')) {
          console.log(`[Line ${i + 1}] WARNING: router may not be exported correctly: ${line}`);
        }
      }
    }
    
    // Check for JSON-like objects being passed directly to router.get
    const routeRegex = /router\.(get|post|put|delete)\s*\(\s*(['"`][^'"`]+['"`])\s*,\s*\{[^:]*:[^}]*\}\s*\)/g;
    let match;
    const contentNoComments = content.replace(/\/\/.*$/gm, '');
    
    while ((match = routeRegex.exec(contentNoComments)) !== null) {
      console.log(`ERROR: Found JSON object being passed as callback to ${match[1]}. Context: ${match[0]}`);
    }
    
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
  }
}

// Scan route files in the routes directory
const routesDir = path.join(__dirname, 'routes');
fs.readdirSync(routesDir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(routesDir, file);
    scanFile(filePath);
  }
});

console.log('\nFinished scanning all routes.'); 