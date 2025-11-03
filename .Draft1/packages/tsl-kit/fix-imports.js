// Quick script to add .js extensions to all local imports
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const files = glob.sync('src/**/*.ts{,x}', { cwd: __dirname });

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace local imports without .js extension
  content = content.replace(
    /from ['"](\.\/.+?)(['"]\s*$)/gm,
    (match, p1, p2) => {
      if (p1.endsWith('.js') || p1.endsWith('.tsx') || p1.endsWith('.ts')) {
        return match;
      }
      return `from '${p1}.js'${p2}`;
    }
  );
  
  fs.writeFileSync(fullPath, content);
});

console.log(`Fixed ${files.length} files`);



