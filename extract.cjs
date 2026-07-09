const { PDFParse, VerbosityLevel } = require('pdf-parse');
const fs = require('fs');
const buf = fs.readFileSync('./Straightway courier proposal.pdf');
(async () => {
  const parser = new PDFParse(buf);
  const pages = await parser.getPages();
  for (const page of pages) {
    const content = await page.getContent();
    console.log('--- Page ---');
    console.log(content.text);
  }
})().catch(e => console.error(e));
