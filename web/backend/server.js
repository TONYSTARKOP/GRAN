const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const COMPILER_PATH = path.resolve(__dirname, '../../gran');
const TEMP_FILE = path.resolve(__dirname, 'temp.gran');

app.post('/compile', (req, res) => {
    const code = req.body.code || '';
    fs.writeFileSync(TEMP_FILE, code);
    exec(`${COMPILER_PATH} ${TEMP_FILE}`, { cwd: path.resolve(__dirname, '../../') }, (error, stdout, stderr) => {
        console.log('STDOUT:', stdout);
        console.log('STDERR:', stderr);
        if (error) {
            return res.json({ error: stderr || error.message });
        }
        // Parse phase outputs from stderr, final output from stdout
        const lexer = extractSection(stderr, 'Lexical analysis complete.', 'Parsing complete.');
        const parser = extractSection(stderr, 'Parsing complete.', 'IR dump:');
        const ir = extractSection(stderr, 'IR dump:', 'Running program...');
        const final = stdout; // The actual program output
        res.json({
            lexer: lexer.trim(),
            parser: parser.trim(),
            ir: ir.trim(),
            final: final.trim()
        });
        fs.unlinkSync(TEMP_FILE);
    });
});

function extractSection(text, startMarker, endMarker) {
    let start = text.indexOf(startMarker);
    if (start === -1) return '';
    start += startMarker.length;
    let end = text.indexOf(endMarker, start);
    if (end === -1) return text.slice(start);
    return text.slice(start, end);
}

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Node backend running on http://localhost:${PORT}`);
});
