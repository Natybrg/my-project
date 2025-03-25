const fs = require('fs');
const path = require('path');

// Error message from the server crash
const errorMessage = `Error: Route.get() requires a callback function but got a [object Object]    
    at Route.<computed> [as get] (C:\\Users\\נתי\\Desktop\\my-project\\server\\node_modules\\express\\lib\\router\\route.js:216:15)
    at proto.<computed> [as get] (C:\\Users\\נתי\\Desktop\\my-project\\server\\node_modules\\express\\lib\\router\\index.js:521:19)
    at Object.<anonymous> (C:\\Users\\נתי\\Desktop\\my-project\\server\\routes\\auth.js:310:8)
    at Module._compile (node:internal/modules/cjs/loader:1554:14)
    at Object..js (node:internal/modules/cjs/loader:1706:10)
    at Module.load (node:internal/modules/cjs/loader:1289:32)
    at Function._load (node:internal/modules/cjs/loader:1108:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)
    at Module.require (node:internal/modules/cjs/loader:1311:12)`;

// Parse the error message to extract file and line information
function parseErrorMessage(errorMsg) {
  const lines = errorMsg.split('\n');
  const errorFiles = [];
  
  for (const line of lines) {
    // Look for lines with file paths
    if (line.includes('\\routes\\')) {
      const matches = line.match(/\(([^:]+):(\d+):(\d+)\)/);
      if (matches && matches.length >= 4) {
        const filePath = matches[1];
        const lineNumber = parseInt(matches[2], 10);
        const columnNumber = parseInt(matches[3], 10);
        
        errorFiles.push({
          filePath,
          lineNumber,
          columnNumber
        });
      }
    }
  }
  
  return errorFiles;
}

// Analyze the error message
const errorLocations = parseErrorMessage(errorMessage);
console.log('Found error locations:', errorLocations);

// Check the content at the error location
errorLocations.forEach(location => {
  try {
    if (fs.existsSync(location.filePath)) {
      const content = fs.readFileSync(location.filePath, 'utf8');
      const lines = content.split('\n');
      
      console.log(`\nError in file: ${location.filePath}`);
      console.log(`Line ${location.lineNumber}, Column ${location.columnNumber}`);
      
      // Show the error line and surrounding lines for context
      const startLine = Math.max(0, location.lineNumber - 5);
      const endLine = Math.min(lines.length, location.lineNumber + 5);
      
      console.log('\nContext:');
      for (let i = startLine; i < endLine; i++) {
        const lineNumber = i + 1; // Lines are 1-indexed
        const prefix = lineNumber === location.lineNumber ? '>>> ' : '    ';
        console.log(`${prefix}${lineNumber}: ${lines[i]}`);
      }
    } else {
      console.log(`File not found: ${location.filePath}`);
    }
  } catch (err) {
    console.error(`Error analyzing ${location.filePath}:`, err);
  }
});

// Provide potential solutions
console.log('\nPossible fixes:');
console.log('1. If there is a router.get() call with an object passed directly, replace it with a callback function');
console.log('2. Ensure all middleware are functions, not objects');
console.log('3. Check for any routes defined after module.exports');
console.log('4. Look for typos in route definition such as missing callbacks or parentheses');
console.log('5. Ensure router is properly imported and exported'); 