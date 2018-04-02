from gensim import corpora, similarities
import gensim

dictionary = corpora.Dictionary.load('modules.dict')

print "Dictionary entries: " + str(dictionary.num_pos)