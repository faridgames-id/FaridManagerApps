import json
import re

log_path = r'C:\Users\Pongo\.gemini\antigravity-ide\brain\b0aa0070-c43d-4bb3-8df0-c59f8a1d19a5\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'const ffReadyCount = ffAccounts.filter' in line:
            # try to parse json and write it out
            try:
                data = json.loads(line)
                with open('found_dashboard.json', 'w', encoding='utf-8') as out_f:
                    json.dump(data, out_f, indent=2)
                break
            except:
                pass
