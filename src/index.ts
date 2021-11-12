import fs from 'fs';

const filePath = process.argv[2];
if (!filePath || !fs.existsSync(filePath)) {
  console.error('Requires a file as an argument');
  process.exit(1);
}

fs.readFileSync(filePath);
