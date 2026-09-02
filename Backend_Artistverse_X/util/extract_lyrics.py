import re

def strip_emojis(text):
    # Regex pattern to match emojis
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
        "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
        "]+", flags=re.UNICODE
    )
    return emoji_pattern.sub('', text)

def extract_lyrics(response):
    if not response:
        return ""
    
    # Strip emojis
    cleaned = strip_emojis(response)
    
    lines = cleaned.split('\n')
    filtered_lines = []
    
    # Filter out typical LLM commentary
    skip_prefixes = (
        'here is', 'here are', 'sure', 'certainly', 'hope you', 'enjoy this', 
        'note:', 'disclaimer:', 'written by', 'song title:', 'title:'
    )
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        
        # Skip conversational filler lines
        lower_line = stripped.lower()
        if any(lower_line.startswith(prefix) for prefix in skip_prefixes):
            continue
            
        # Strip enclosing quotation marks if present
        if stripped.startswith('"') and stripped.endswith('"') and len(stripped) > 2:
            stripped = stripped[1:-1].strip()
            
        filtered_lines.append(stripped)
        
    return add_line_breaks(filtered_lines)

def add_line_breaks(lines):
    section_indices = [idx for idx, line in enumerate(lines) if line.startswith('[') or line.startswith('(')]
    for idx in reversed(section_indices[1:]):
        lines.insert(idx, '')
    return '\n'.join(lines)