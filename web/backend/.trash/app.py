from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

COMPILER_PATH = '../../gran'  # Adjust if needed
TEMP_FILE = 'temp.gran'

@app.route('/compile', methods=['POST'])
def compile_code():
    data = request.get_json()
    code = data.get('code', '')
    with open(TEMP_FILE, 'w') as f:
        f.write(code)
    try:
        # Run the compiler and capture output
        result = subprocess.run([
            COMPILER_PATH, TEMP_FILE
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        output = result.stdout
        # Parse output for each phase
        lexer_out = extract_section(output, 'Lexical analysis complete.', 'Parsing complete.')
        parser_out = extract_section(output, 'Parsing complete.', 'IR generation complete')
        ir_out = extract_section(output, 'IR generation complete', 'Running program...')
        final_out = extract_section(output, 'Running program...', 'Program execution complete')
        return jsonify({
            'lexer': lexer_out.strip(),
            'parser': parser_out.strip(),
            'ir': ir_out.strip(),
            'final': final_out.strip()
        })
    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        if os.path.exists(TEMP_FILE):
            os.remove(TEMP_FILE)

def extract_section(text, start_marker, end_marker):
    start = text.find(start_marker)
    if start == -1:
        return ''
    start += len(start_marker)
    end = text.find(end_marker, start)
    if end == -1:
        return text[start:]
    return text[start:end]

if __name__ == '__main__':
    app.run(debug=True)
