from flask import Flask, render_template
from collections import defaultdict
import string
import os

app = Flask(__name__)

def load_words_from_file(filepath):
    words_by_letter = defaultdict(list)

    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return {}

    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            for line in file:
                word = line.strip()
                if word and word[0].upper() in string.ascii_uppercase:
                    first_letter = word[0].upper()
                    words_by_letter[first_letter].append(word)
    except UnicodeDecodeError as e:
        print(f"Error decoding file {filepath}: {e}")
        return {}

    return words_by_letter

@app.route('/')
def home():
    words_by_letter = load_words_from_file('words.txt')
    return render_template('index.html', words_by_letter=words_by_letter)

if __name__ == '__main__':
    app.run(debug=True)
