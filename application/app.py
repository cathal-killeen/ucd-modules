from flask import request, render_template, jsonify, url_for, redirect, g, session
from .models import AppUser, Module, School, Staff, OAuth2Token
from index import app, db, mongo_db
from bson.json_util import dumps
from sqlalchemy.exc import IntegrityError
from .utils.auth import generate_token, requires_auth, verify_token
import datetime

from authlib.flask.client import OAuth
from authlib.client.apps import google

import lsi_search
# import lda_search
import recommendations

def dump(obj):
    dictionary = {}
    for attr in dir(obj):
        dictionary[attr] = getattr(obj, attr)
        # print("obj.%s = %r" % (attr, getattr(obj, attr)))
    return dictionary

def session_login(user, access_token, permanent=True):
    session['current_user'] = user
    session['access_token'] = access_token
    session.permanent = permanent


def session_logout():
    if 'current_user' in session:
        del session['current_user']
    if 'access_token' in session:
        del session['access_token']

def get_current_user_token():
    user = session.get('current_user')
    if not user:
        return None
    
    token = session.get('access_token')
    if not token:
        return None

    return {'id': user, 'access_token': token }

def get_current_user_profile():
    curr_user = session.get('current_user')
    if not curr_user:
        return None

    user_profile = AppUser.query.filter_by(email=curr_user).first()

    if user_profile:
        return user_profile.as_dict()

    return None

def fetch_google_token(name):
    current_user = get_current_user_token()

    if current_user:
        item = OAuth2Token.query.filter_by(
            user_id=current_user['id'], access_token=current_user['access_token']
        ).first()
        if item:
            return item.to_token()

oauth = OAuth(app, fetch_token=fetch_google_token)
google.register_to(oauth)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/<path:path>', methods=['GET'])
def any_root_path(path):
    return render_template('index.html')


@app.route('/api/login')
def login():
    redirect_to = request.args.get('redirectTo')
    if redirect_to:
        session['redirect_to'] = redirect_to
    redirect_uri = url_for('authorize', _external=True)
    return oauth.google.authorize_redirect(redirect_uri=redirect_uri)

@app.route('/api/login/authorized')
def authorize():
    token = google.authorize_access_token()

    # print token
    # get user info 
    user_profile = google.profile()
    
    # print response attributes
    # dump(user_profile)

    # get users email
    curr_user = user_profile['email']
    # store session
    session_login(curr_user, token['access_token'], True)
    # persist token
    OAuth2Token.save(curr_user, token)

    # find existing user
    user = AppUser.query.filter_by(email=curr_user).first()
    # print user.count_logins
    # if user exists already, update info
    if user:
        user.picture_url = user_profile['picture'],
        user.count_logins = user.count_logins + 1,
        user.last_login=datetime.datetime.utcnow()

    # else create new user
    else:
        user = AppUser(
            email=user_profile['email'],
            name=user_profile['name'],
            first_name=user_profile['given_name'],
            last_name=user_profile['family_name'],
            picture_url=user_profile['picture'],
            count_logins=1,
            last_login=datetime.datetime.utcnow(),
            date_joined=datetime.datetime.utcnow()
        )
        db.session.add(user)
    db.session.commit()

    # redirect to home
    redirect_to = session['redirect_to']

    if redirect_to:
        return redirect(url_for('index', redirectTo=redirect_to))
    else:
        return redirect(url_for('index'))


def flatten_like_list (like_list):
    flat = []
    for like in like_list:
        flat.append(like['item_id'])
    return flat

@app.route('/api/profile')
def get_profile():
    user_profile = get_current_user_profile()

    if user_profile:
        return jsonify(profile=user_profile), 200
    else:
        return jsonify(error="User not logged in"), 401

@app.route('/api/profile/likes')
def get_profile_likes():
    user = get_current_user_profile()

    if not user:
        return jsonify(error="User not logged in"), 401

    try:
        email = user['email']

        module_likes_list=flatten_like_list(list(mongo_db['likes'].find({'type':'module', 'user_id': email, 'is_liked': True}, {'_id':0, 'item_id':1 })))
        school_likes_list=flatten_like_list(list(mongo_db['likes'].find({'type':'school', 'user_id': email, 'is_liked': True}, {'_id':0, 'item_id':1 })))
        staff_likes_list=flatten_like_list(list(mongo_db['likes'].find({'type':'staff', 'user_id': email, 'is_liked': True}, {'_id':0, 'item_id':1 })))

        module_likes = Module.get_modules_code_list(module_likes_list)
        school_likes = School.get_schools_urlname_list(school_likes_list)
        staff_likes = Staff.get_staff_urlname_list(staff_likes_list)

        return jsonify(profile=user,module_likes=module_likes,school_likes=school_likes,staff_likes=staff_likes)
    except:
        return jsonify(error="Something went wrong"), 500

@app.route('/api/build_recommendations')
def build_recommendations():
    try:
        recommendations.build_recommendations(mongo_db)

        return jsonify(build_recommendations_success=True), 200
    except:
        return jsonify(build_recommendations_success=False), 500

@app.route('/api/profile/recommendations')
def get_recommendations():
    try:
        user = get_current_user_profile()

        if not user:
            return jsonify(error="User not logged in"), 401

        email = user['email']

        return_list = []

        recs = mongo_db['recommendations'].find_one({'user_id': email})  

        if recs:
            modules = recs['modules']
            
            if modules:
                for module in modules:
                    return_item = {}
                    return_item['module'] = Module.get_module_by_code(module[0])
                    return_item['estimate'] = module[1]

                    return_list.append(return_item)

        return jsonify(recommended_modules=return_list)
    except:
        return jsonify(error="Something went wrong. Possibly: MongoDB error"), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    current_user = get_current_user_token()

    if current_user:
        OAuth2Token.query.filter_by(
            user_id=current_user['id'], access_token=current_user['access_token']
        ).delete()
        db.session.commit()

    session_logout()

    return jsonify(logout_success=True), 200

@app.route('/api/unlike', methods=['POST'])
def unlike():
    try:
        user = get_current_user_profile()

        if not user:
            return jsonify(error="User not logged in"), 401
        
        # print resp
        email = user['email']
        # # print email

        params = request.get_json()
        # print params
        item_id = params['item_id']
        # print item_id
        like_type = params['type']
        # print like_type
        if like_type == 'module':
            module = Module.get_module_by_code(item_id)
            # print module
            if module:
                unlike_item = mongo_db['likes'].update(
                    {'item_id': module['code'], 'user_id': email, 'type': 'module'},
                    {'$set': {'is_liked': False}},
                    upsert=True
                )
                # print unlike_item

                 # delete entry if it has all false/null values
                mongo_db['likes'].delete_one(
                    {'item_id': module['code'], 'user_id': email, 'type': 'module', 
                        'is_liked': {'$in': [None,False]}, 
                        'is_mc_liked': {'$in': [None,False]},
                        'is_school_liked': {'$in': [None,False]} }
                )

            else:
                return jsonify(unlike_success=False, message='Module not found')
        elif like_type == 'staff':
            staff = Staff.query.filter_by(url_name=item_id).first()
            if staff:
                staff = staff.as_dict()
                # print staff
                mongo_db['likes'].delete_one(
                    {'item_id': staff['url_name'], 'user_id': email, 'type': 'staff'}
                )

                modules_by_staff = Module.get_modules_by_staff(staff['raw_name'])
                if modules_by_staff:
                    # print modules_by_staff
                    for module in modules_by_staff:
                        mongo_db['likes'].update(
                            {'item_id': module['code'], 'user_id': email, 'type': 'module'},
                            {'$set': {'is_mc_liked': False}},
                            upsert=True
                        )

                        # delete entry if it has all false/null values
                        mongo_db['likes'].delete_one(
                            {'item_id': module['code'], 'user_id': email, 'type': 'module', 
                                'is_liked': {'$in': [None,False]}, 
                                'is_mc_liked': {'$in': [None,False]},
                                'is_school_liked': {'$in': [None,False]} }
                        )


            else:
                return jsonify(unlike_success=False, message='Staff member not found')
        elif like_type == 'school':
            school = School.get_school(item_id)
            if school:
                mongo_db['likes'].delete_one(
                    {'item_id': school['url_name'], 'user_id': email, 'type': 'school'}
                )

                school_modules = Module.get_school(school['name'])
                if school_modules:
                    for module in school_modules:
                        mongo_db['likes'].update(
                            {'item_id': module['code'], 'user_id': email, 'type': 'module'},
                            {'$set': {'is_school_liked': False}},
                            upsert=True
                        )

                        # delete entry if it has all false/null values
                        mongo_db['likes'].delete_one(
                            {'item_id': module['code'], 'user_id': email, 'type': 'module', 
                                'is_liked': {'$in': [None,False]}, 
                                'is_mc_liked': {'$in': [None,False]},
                                'is_school_liked': {'$in': [None,False]} }
                        )
        else:
            return jsonify(unlike_success=False, message='Item type invalid')
       

        return jsonify(unlike_success=True), 200
    except:
        return jsonify(error="Something went wrong. Possibly: MongoDB error"), 500



@app.route('/api/like', methods=['POST'])
def like():
    try:
        user = get_current_user_profile()

        if not user:
            return jsonify(error="User not logged in"), 401
        
        # print resp
        email = user['email']
        # print email

        params = request.get_json()
        # print params
        item_id = params['item_id']
        # print item_id
        like_type = params['type']
        # print like_type
        if like_type == 'module':
            module = Module.get_module_by_code(item_id)
            # print module
            if module:
                like_item = mongo_db['likes'].update(
                    {'item_id': module['code'], 'user_id': email, 'type': 'module'},
                    {'$set': {'is_liked': True}},
                    upsert=True
                )
                # print like_item
            else:
                return jsonify(like_success=False, message='Module not found'), 400
        elif like_type == 'staff':
            staff = Staff.query.filter_by(url_name=item_id).first()
            if staff:
                staff = staff.as_dict()
                # print staff
                mongo_db['likes'].update(
                    {'item_id': staff['url_name'], 'user_id': email, 'type': 'staff'},
                    {'$set': {'is_liked': True}},
                    upsert=True
                )

                modules_by_staff = Module.get_modules_by_staff(staff['raw_name'])
                if modules_by_staff:
                    # print modules_by_staff
                    for module in modules_by_staff:
                        mongo_db['likes'].update(
                            {'item_id': module['code'], 'user_id': email, 'type': 'module'},
                            {'$set': {'is_mc_liked': True}},
                            upsert=True
                        )
            else:
                return jsonify(like_success=False, message='Staff member not found'), 400
        elif like_type == 'school':
            school = School.get_school(item_id)
            if school:
                mongo_db['likes'].update(
                    {'item_id': school['url_name'], 'user_id': email, 'type': 'school'},
                    {'$set': {'is_liked': True}},
                    upsert=True
                )

                school_modules = Module.get_school(school['name'])
                if school_modules:
                    for module in school_modules:
                        mongo_db['likes'].update(
                            {'item_id': module['code'], 'user_id': email, 'type': 'module'},
                            {'$set': {'is_school_liked': True}},
                            upsert=True
                        )
        else:
            return jsonify(like_success=False, message='Item type invalid'), 400
       

        return jsonify(like_success=True), 200
    except:
        return jsonify(error="Something went wrong. Possibly: MongoDB error"), 500


@app.route("/api/search", methods=['GET'])
def search_query():
    q = request.args.get('q')

    if q is None:
        return jsonify(error="No query"), 403

    return_list = Module.search_lsi(q, 100)

    if len(return_list) <= 0:
        return jsonify(error="No results matched your query"), 403

    return jsonify(modules = return_list)


# @app.route("/api/get_token", methods=["POST"])
# def get_token():
#     incoming = request.get_json()
#     user = User.get_user_with_email_and_password(incoming["email"], incoming["password"])
#     if user:
#         return jsonify(token=generate_token(user))

#     return jsonify(error=True), 403


# @app.route("/api/is_token_valid", methods=["POST"])
# def is_token_valid():
#     incoming = request.get_json()
#     is_valid = verify_token(incoming["token"])

#     if is_valid:
#         return jsonify(token_is_valid=True)
#     else:
#         return jsonify(token_is_valid=False), 403


@app.route("/api/modules/<string:module_code>", methods=["GET"])
def get_module(module_code):
    module = Module.get_module_by_code(module_code)
    module_liked = False
    staff_liked = False

    # print(module)
    if(module):
        module_coordinator = Staff.query.filter_by(raw_name=module['module_coordinator']).first()
        # print module_coordinator
        if module_coordinator:
            mc = module_coordinator.as_dict()
            try:
                user = get_current_user_profile()
                if user:
                    email = user['email']
                    module_like = mongo_db['likes'].find_one({'item_id': module['code'], 'user_id': email})
                    # print module_like
                    if 'is_liked' in module_like:
                        module_liked = module_like['is_liked']
                    if 'is_mc_liked' in module_like:
                        staff_liked = module_like['is_mc_liked']
                return jsonify(module=module,module_coordinator=mc,module_liked=module_liked, staff_liked=staff_liked)
            except:
                return jsonify(module=module,module_coordinator=mc,module_liked=module_liked, staff_liked=staff_liked)
        else: 
            return jsonify(module=module,module_coordinator={},module_liked=module_liked, staff_liked=staff_liked)
    else:
        return jsonify(error = "No module with that code exists"), 404

# @app.route("/api/temp/programme_modules", methods=['GET'])
# def programme_modules():
#     for doc in mongo_db['programmes'].find():

#         existing_modules = Module.get_modules_code_list(doc['modules_list'])
#         # # print existing_modules
#         existing_modules_list = []
#         if existing_modules:
#             for module in existing_modules:
#                 existing_modules_list.append(module['code'])
        

#         mongo_db['programmes'].update(
#             {'code': doc['code']},
#             {'$set': {'existing_modules': existing_modules_list}},
#             upsert=True
#         )

#     return 'Ok', 200

@app.route("/api/modules_alt/<string:module_code>", methods=["GET"])
def get_module_alt(module_code):
    
    module = Module.get_module_by_code(module_code)
    # # print(mongo_module)
    if(module):
        keywords = [] #lda_search.search(module['gensim_doc'])
        similar_modules = Module.get_similar(module['gensim_doc'],6)
        mongo_module = mongo_db['modules'].find_one({"code":module_code})
        # print mongo_module
        if mongo_module:
            return jsonify(schedule=mongo_module['schedule'], workload=mongo_module['workload'], assessment=mongo_module['assessment'], keywords=keywords, similar_modules=similar_modules)
        else:
            return jsonify(keywords=keywords, schedule=[], workload=[], assessment=[], similar_modules=similar_modules)

    else:
        return jsonify(error = "No module with that code exists"), 404


# @app.route("/api/modules/create", methods=["POST"])
# def create_module():
#     # print(request)
#     incoming = request.get_json()
#     # print(incoming)
#     try:
#         module = Module(
#             code = incoming['code'],
#             code_subject = incoming['code_subject'],
#             code_number = incoming['code_number'],
#             school = incoming['school'],
#             short_title = incoming['short_title'],
#             long_title = incoming['long_title'],
#             description = incoming['description'],
#             learning_outcomes = incoming['learning_outcomes']
#         )
#         db.session.add(module)
#         db.session.commit()
#     except IntegrityError:
#         return jsonify(message="Module with that code already exists"), 409

#     new_module = Module.get_module_by_code(incoming['code'])

#     return jsonify(
#         new_module
#     )

@app.route("/api/build_similar_modules", methods=["GET"])
def build_similar():
    # mongo_db['modules'].update({}, {'$unset': {'similar_modules':1}} , multi=True)
    # mongo_db['modules'].delete_many({'code_subject': {'$exists': False}})
    # modules = Module.query.all()

    # for module_o in modules:
    #     module = module_o.as_dict()
    #     similar_modules = Module.get_similar(module['gensim_doc'],6)


    #     mongo_db['modules'].update(
    #         {'code': module['code']},
    #         {'$set': {'similar_modules': similar_modules}},
    #         upsert=True
    #     )

    return "Updated modules"

    


@app.route("/api/school/<string:school_name>", methods=["GET"])
def get_school(school_name):
    school = School.get_school(school_name)

    # print(school)

    if(school):
        # modules
        modules = Module.get_school(school['name'])
        school_liked = False
        
        # staff
        ### staff names
        staff_names = Module.query.with_entities(Module.module_coordinator).filter_by(school=school['name']).all()

        ### staff list
        staff_list = []
        for i in range(len(staff_names)):
            staff_list.append(staff_names[i][0])

        ### staff db items
        staff_members = Staff.query.filter(Staff.raw_name.in_(staff_list)).all()
        
        ### staff dicts for json
        staff_dicts = []
        for i in range(len(staff_members)):
            staff_dicts.append(staff_members[i].as_dict())

        try:
            user = get_current_user_profile()
            if user:
                email = user['email']
                school_like = mongo_db['likes'].find_one({'item_id': school['url_name'], 'user_id': email})

                # print school_like
                if 'is_liked' in school_like:
                    school_liked = school_like['is_liked']
        
            return jsonify(school=school, modules=modules, staff=staff_dicts, school_liked=school_liked)
        except:
            return jsonify(school=school, modules=modules, staff=staff_dicts, school_liked=school_liked)


        return jsonify(school=school, modules=modules, staff=staff_dicts)
    else:
        return jsonify(error = "No school with that name exists"), 404


@app.route("/api/schools", methods=["GET"])
def get_schools():
    schools = School.query.all()

    # print(schools)
    school_list = []
    for i in range(len(schools)):
        school_list.append(schools[i].as_dict())

    if(schools):
        return jsonify(schools=school_list)
    else:
        return jsonify(error = "Nothing found"), 404

@app.route("/api/staff", methods=["GET"])
def get_staff():
    staff = Staff.query.all()

    # print(staff)
    staff_list = []
    for i in range(len(staff)):
        staff_list.append(staff[i].as_dict())

    if(staff):
        return jsonify(staff=staff_list)
    else:
        return jsonify(error = "Nothing found"), 404

@app.route("/api/staff/<string:staff_id>", methods=["GET"])
def get_staff_member(staff_id):
    staff_member = Staff.get_staff_with_schools(staff_id)
    # print staff_member

    if staff_member:
        staff_liked = False
        try:
            user = get_current_user_profile()
            if user:
                email = user['email']
                staff_like = mongo_db['likes'].find_one({'item_id': staff_member[0]['url_name'], 'user_id': email})

                # print staff_like
                if 'is_liked' in staff_like:
                    staff_liked = staff_like['is_liked']

            return jsonify(staff_member=staff_member[0], staff_school=staff_member[1], staff_modules=staff_member[2], staff_liked=staff_liked)
        except:
            return jsonify(staff_member=staff_member[0], staff_school=staff_member[1], staff_modules=staff_member[2], staff_liked=staff_liked)
    else:
        return jsonify(error = "Nothing found"), 404



# modules
# @app.route("/api/modules/create", methods=["PUT"])
# def update_module():
#     incoming = request.get_json()

#     attr = {}
#     for key, value in incoming.items():
#         # # print key, value
#         attr[key] = value

#     # print(attr)
#     try:
#         module = Module.query.filter_by(code=incoming['code']).first()

#         module.subject = attr['subject']
#         module.semester = attr['semester']
#         module.module_coordinator = attr['module_coordinator']
#         module.credits = attr['credits']
#         module.level = attr['level']
#         module.compensation = attr['compensation']
#         module.resit_opps = attr['resit_opps']
#         module.remediation = attr['remediation']
#         module.pre_reqs = attr['pre_reqs']
#         module.required = attr['required']
#         module.co_reqs = attr['co_reqs']
#         module.incompatibles = attr['incompatibles']
#         module.additional_info = attr['additional_info']
#         module.equiv_modules = attr['equiv_modules']
#         module.requirements = attr['requirements']
#         module.excluded = attr['excluded']
#         module.recommended = attr['recommended']
#         module.count_workload = attr['count_workload']
#         module.count_assess = attr['count_assess']
    
#         db.session.commit()
#     except IntegrityError:
#         return jsonify(message="Module does not exist"), 409

#     new_module = Module.get_module_by_code(incoming['code'])

#     return jsonify(
#         new_module
#     )

@app.route("/api/list_all_modules", methods=["GET"])
def list_all_modules():
    modules = Module.get_list_of_codes()

    if(modules):
        return jsonify(modules)
    else:
        return jsonify(error="None found")



