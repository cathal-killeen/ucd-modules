import psycopg2
import sys
import string

import nltk
from nltk.corpus import stopwords

# establish db connection
conn = psycopg2.connect("dbname=Cathal host=localhost port=5432")


cur = conn.cursor()

cur.execute("UPDATE module SET gensim_id = NULL")
cur.execute("SELECT code, code_subject, code_number, school, subject, module_coordinator, short_title, long_title, description, learning_outcomes FROM module")

modules = cur.fetchall()

corpus_file = open("module_corpus.txt", "w")

gensim_id = 0

for module in modules:
    line_string = ""

    for item in module:
        if item is not None:
            # converts the string to lowercase, removes punctuation and newline characters, and removes any trailing whitespace
            stripped_item = item.lower().translate(None, string.punctuation).replace('\n', ' ').replace('\r', '').replace('\t', ' ').strip()

            line_string = line_string + stripped_item + " "
    
    cur.execute("UPDATE module SET gensim_id = (%s), gensim_doc = (%s) WHERE code = (%s)", (gensim_id, line_string, module[0]))

    tokens = nltk.word_tokenize(line_string)
    stop = set(stopwords.words('english'))

    clean_tokens = [t for t in tokens if t not in stop]

    final_string = " ".join(clean_tokens)

    corpus_file.write(final_string + '\n')

    gensim_id += 1

conn.commit()
cur.close()





