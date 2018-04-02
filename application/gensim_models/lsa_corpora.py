from gensim import corpora, similarities

import gensim

# create a dictionary of all words from the module_corpus.txt file
dictionary = corpora.Dictionary(line.lower().split() for line in open('module_corpus.txt'))

# save the formatted dictionary for future use
dictionary.save('modules.dict')

# create a gensim corpus in bag-of-words format from the module_corpus.txt file
corpus = [dictionary.doc2bow(line.lower().split()) for line in open('module_corpus.txt')]

# save the bag-of-words corpus for future use
corpora.MmCorpus.serialize('corpus.mm', corpus)

# generate an lsi index of the corpus with 800 topics
lsi = gensim.models.lsimodel.LsiModel(corpus=corpus, id2word=dictionary, num_topics=1600)

# save the lsi model for future use
lsi.save('lsimodel')

# save the similarities matrix
index = similarities.MatrixSimilarity(lsi[corpus])
index.save('modules.index')

print "finished lsi indexing"

# create the lda model of the corpus
lda = gensim.models.ldamodel.LdaModel(corpus=corpus, id2word=dictionary, num_topics=1600, update_every=1, chunksize=100, passes=1)

lda.save('ldamodel')

print "finished lda indexing"
