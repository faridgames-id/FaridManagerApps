import json
import os

log_path = r'C:\Users\Pongo\.gemini\antigravity-ide\brain\b0aa0070-c43d-4bb3-8df0-c59f8a1d19a5\.system_generated\logs\transcript.jsonl'

files = {}
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] in ['write_to_file', 'replace_file_content']:
                        args = call['args']
                        if 'TargetFile' in args and 'CodeContent' in args:
                            file_path = args['TargetFile']
                            # Only capture the first time we write the file
                            if file_path not in files:
                                files[file_path] = args['CodeContent']
        except Exception as e:
            pass

for path, content in files.items():
    basename = os.path.basename(path)
    if basename in ['globals.css', 'layout.js', 'page.js', 'DashboardTab.js', 'LoginOverlay.js', 'Sidebar.js']:
        with open(f'orig_{basename}', 'w', encoding='utf-8') as out_f:
            out_f.write(content)
        print(f"Extracted orig_{basename}")
