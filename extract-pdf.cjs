const fs = require('fs');
const pdf = require('pdf-parse');
const buf = fs.readFileSync('./Straightway courier proposal.pdf');
pdf(buf).then(d => console.log(d.text)).catch(e => console.error('Err:', e));
