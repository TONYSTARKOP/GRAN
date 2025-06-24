// This script assumes a backend endpoint or local API to process the code and return each phase's output.
// For now, it uses mock data. You need to connect it to your backend for real results.

function runCompiler() {
    const code = document.getElementById('codeInput').value;
    fetch('http://localhost:5000/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('lexerOutput').textContent = data.lexer || 'No output';
        document.getElementById('parserOutput').textContent = data.parser || 'No output';
        document.getElementById('irOutput').textContent = data.ir || 'No output';
        document.getElementById('finalOutput').textContent = data.final || 'No output';
        if (data.error) {
            document.getElementById('finalOutput').textContent = 'Error: ' + data.error;
        }
    })
    .catch(err => {
        document.getElementById('finalOutput').textContent = 'Request failed: ' + err;
    });
}
