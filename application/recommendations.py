import pandas as pd

from surprise import NormalPredictor
from surprise import Dataset
from surprise import Reader
from surprise import SVD
from surprise.model_selection import cross_validate

from collections import defaultdict

# module: +15
# school: +4
# staff: +6

# programme: 10 for each module

def create_dataset(mongo_db):
    # Creation of the dataframe. Column names are irrelevant.
    # ratings_dict = {'itemID': [1, 1, 1, 2, 2],
    #                 'userID': [9, 32, 2, 45, 'user_foo'],
    #                 'rating': [3, 2, 4, 3, 1]}

    ratings_dict = {
        'itemID': [],
        'userID': [],
        'rating': [],
    }

    pseudo_list = []

    liked_dict = {}

    # load programmes as pseudo-users for training data
    for doc in mongo_db['programmes'].find():
        code = doc['code']

        pseudo_list.append(code)

        for module in doc['existing_modules']:
            ratings_dict['itemID'].append(module)
            ratings_dict['userID'].append(code)
            ratings_dict['rating'].append(10)

    for doc in mongo_db['likes'].find({'type':'module'}):
        user_id = doc['user_id']
        item_id = doc['item_id']

        rating = 0

        # create the user liked array if it doesnt exist already
        if user_id in liked_dict:
            # print 'user likes array already exists'
            do_nothing = 1
        else:
            liked_dict[user_id] = []

        if 'is_liked' in doc:
            if doc['is_liked']:
                rating += 15
                liked_dict[user_id].append(item_id)

        if 'is_mc_liked' in doc:
            if doc['is_mc_liked']:
                rating += 6

        if 'is_school_liked' in doc:
            if doc['is_school_liked']:
                rating += 4

        ratings_dict['itemID'].append(item_id)
        ratings_dict['userID'].append(user_id)
        ratings_dict['rating'].append(rating)

    df = pd.DataFrame(ratings_dict)

    # A reader is still needed but only the rating_scale param is requiered.
    reader = Reader(rating_scale=(0, 25))

    # The columns must correspond to user id, item id and ratings (in that order).
    data = Dataset.load_from_df(df[['userID', 'itemID', 'rating']], reader)

    return (data, pseudo_list, liked_dict)

    # # We can now use this dataset as we please, e.g. calling cross_validate
    # cross_validate(NormalPredictor(), data, cv=2)

def get_predictions(data):
    # First train an SVD algorithm on the movielens dataset.
    trainset = data.build_full_trainset()
    algo = SVD()
    algo.fit(trainset)

    # Than predict ratings for all pairs (u, i) that are NOT in the training set.
    testset = trainset.build_testset()
    predictions = algo.test(testset)

    return predictions


def get_top_n(predictions, liked_dict, pseudo_list, n=10):
    '''Return the top-N recommendation for each user from a set of predictions.

    Args:
        predictions(list of Prediction objects): The list of predictions, as
            returned by the test method of an algorithm.
        n(int): The number of recommendation to output for each user. Default
            is 10.

    Returns:
    A dict where keys are user (raw) ids and values are lists of tuples:
        [(raw item id, rating estimation), ...] of size n.
    '''

    # First map the predictions to each user.
    top_n = defaultdict(list)
    for uid, iid, true_r, est, _ in predictions:
        # dont save pseudo user predictions
        if uid not in pseudo_list:
            # dont save already liked modules
            if iid not in liked_dict[uid]:
                top_n[uid].append((iid, est))

    # Then sort the predictions for each user and retrieve the k highest ones.
    for uid, user_ratings in top_n.items():
        user_ratings.sort(key=lambda x: x[1], reverse=True)
        top_n[uid] = user_ratings[:n]

    return top_n


def build_recommendations (mongo_db):
    (data, pseudo_list, liked_dict) = create_dataset(mongo_db)

    predictions = get_predictions(data)

    top_n = get_top_n(predictions, liked_dict, pseudo_list, n=100)

    # Print the recommended items for each user
    for uid, user_ratings in top_n.items():
        # print(uid, [iid, p_rating for (iid, p_rating) in user_ratings])
        # print(uid, user_ratings)

        mongo_db['recommendations'].update(
            {'user_id': uid},
            {'$set': {'modules': user_ratings}},
            upsert=True
        )




