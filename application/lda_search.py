from gensim import corpora
import gensim

lda = gensim.models.ldamodel.LdaModel.load('application/gensim_models/ldamodel')
dictionary = corpora.Dictionary.load('application/gensim_models/modules.dict')

def search(query):
    vec_bow = dictionary.doc2bow(query.lower().split())

    word_dict = {}

    # get topics associated with document
    topics = lda.get_document_topics(vec_bow)

    for topic in topics:
        terms = lda.show_topic(topic[0])

        for term in terms:
            if (term[1] > 0.15) and (len(term[0]) > 2):
                word_dict[term[0]] = str(term[1])

    return word_dict