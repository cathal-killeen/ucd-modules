from gensim import corpora, similarities
import gensim

# query = "project management"

lsi = gensim.models.lsimodel.LsiModel.load('application/gensim_models/lsimodel')
corpus = corpora.MmCorpus('application/gensim_models/corpus.mm')
index = similarities.MatrixSimilarity.load('application/gensim_models/modules.index')
dictionary = corpora.Dictionary.load('application/gensim_models/modules.dict')

def search(query, num_docs):
    vec_bow = dictionary.doc2bow(query.lower().split())
    vec_lsi = lsi[vec_bow] # convert the query to LSI space

    sims = index[vec_lsi]
    sims = sorted(enumerate(sims), key=lambda item: -item[1])

    top_n = sims[:num_docs]
    clean_sims = [t for t in top_n if t[1] > 0]
    enum_sims = [(i,t[0],t[1]) for i, t in enumerate(clean_sims)]
    sims_dict = dict( ( y, (x, str(z) ) ) for x, y, z in enum_sims )
    return sims_dict

# print search("project management")

