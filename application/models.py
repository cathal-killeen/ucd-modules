from index import db, bcrypt
from sqlalchemy import func

import lsi_search


def to_json(inst, cls):
    """
    Jsonify the sql alchemy query result.
    """
    convert = dict()
    # add your coversions for things like datetime's 
    # and what-not that aren't serializable.
    d = dict()
    for c in cls.__table__.columns:
        v = getattr(inst, c.name)
        if c.type in convert.keys() and v is not None:
            try:
                d[c.name] = convert[c.type](v)
            except:
                d[c.name] = "Error:  Failed to covert using ", str(convert[c.type])
        elif v is None:
            d[c.name] = str()
        else:
            d[c.name] = v
    return json.dumps(d)


class AppUser(db.Model):
    email = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255))
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    picture_url = db.Column(db.String(500))
    count_logins = db.Column(db.Integer(), default=0)
    last_login = db.Column(db.DateTime())
    date_joined = db.Column(db.DateTime())

    def __init__(self, **kwargs):
        super(AppUser, self).__init__(**kwargs)

    def as_dict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    # @staticmethod
    # def get_user_with_email_and_password(email, password):
    #     user = User.query.filter_by(email=email).first()
    #     if user and bcrypt.check_password_hash(user.password, password):
    #         return user
    #     else:
    #         return None


class OAuth2Token(db.Model):
    # id = db.Column(db.Integer(), primary_key=True)
    # use email as userId
    user_id = db.Column(db.String(255), nullable=False)

    token_type = db.Column(db.String(100))
    access_token = db.Column(db.String(500), primary_key=True)
    refresh_token = db.Column(db.String(48))
    expires_at = db.Column(db.Integer, default=0)

    def __init__(self, **kwargs):
        super(OAuth2Token, self).__init__(**kwargs)

    def to_token(self):
        return dict(
            access_token=self.access_token,
            token_type=self.token_type,
            refresh_token=self.refresh_token,
            expires_at=self.expires_at,
        )

    @staticmethod
    def save(current_user, token):
        rf_token = None
        if 'refresh_token' in token:
            rf_token = token['refresh_token']

        new_token = OAuth2Token(
            user_id=current_user,
            token_type=token['token_type'],
            access_token=token['access_token'],
            refresh_token=rf_token,
            expires_at=token['expires_at']
        )

        db.session.add(new_token)
        db.session.commit()


class Staff(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    raw_name = db.Column(db.String(400))
    name = db.Column(db.String(400))
    first_name = db.Column(db.String(400))
    last_name = db.Column(db.String(400))
    short_title = db.Column(db.String(400))
    title = db.Column(db.String(400))
    url_name = db.Column(db.String(4000))
    count_subjects = db.Column(db.Integer())
    count_schools = db.Column(db.Integer())
    count_modules = db.Column(db.Integer())
    image_url = db.Column(db.String(4000))
    image_height = db.Column(db.Integer)
    image_width = db.Column(db.Integer)
    image_portrait = db.Column(db.Boolean, default=True)
    color_code = db.Column(db.String(50))
    unknown_name = db.Column(db.Boolean, default=False)
    school = db.Column(db.Integer, db.ForeignKey('school.id'))
    school_2 = db.Column(db.Integer, db.ForeignKey('school.id'))
    school_3 = db.Column(db.Integer, db.ForeignKey('school.id'))

    def __init__(self, **kwargs):
        super(Module, self).__init__(**kwargs)

    def as_dict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    def get_staff_with_schools(staff_id):
        staff = Staff.get_staff_member(staff_id)
        if staff:
            member = db.session.query(Staff,School).filter(Staff.id == staff['id']).join(School, School.id == Staff.school).first()
            if member:
                return (member[0].as_dict(), member[1].as_dict(), Module.get_modules_by_staff(member[0].raw_name))
            else:
                return None
        else:
            return None

    @staticmethod
    def get_staff_member(query):
        try:
            value = int(query)
            staff = Staff.query.filter_by(id=value).first()
        except ValueError:
            # print query
            if ' ' in query:
                staff = Staff.query.filter(func.lower(Staff.raw_name) == func.lower(query)).first()
                if not staff:
                    staff = Staff.query.filter(func.lower(Staff.name) == func.lower(query)).first()
            else:
                # print 'url_name'
                staff = Staff.query.filter_by(url_name=query).first()
                # print staff

        if staff:
            return staff.as_dict()
        else:
            return None

    @staticmethod
    def get_staff_urlname_list(urlname_list):
        result = Staff.query.filter(Staff.url_name.in_(urlname_list)).all()

        if result:
            staff_list = []
            for i in range(len(result)):
                staff_list.append(result[i].as_dict())
            
            return staff_list
        else:
            return None


class School(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(400))
    url_name = db.Column(db.String(4000))
    count_subjects = db.Column(db.Integer())
    count_staff = db.Column(db.Integer())
    count_modules = db.Column(db.Integer())
    image_url = db.Column(db.String(4000))
    # image_url_thumb = db.Column(db.String(4000))
    color_code = db.Column(db.String(50))

    def __init__(self, **kwargs):
        super(Module, self).__init__(**kwargs)

    def as_dict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    def get_school(query):
        try:
            value = int(query)
            school = School.query.filter_by(id=value).first()
        except ValueError:
            if ' ' in query:
                school = School.query.filter(func.lower(School.name) == func.lower(query)).first()
            else:
                school = School.query.filter(func.lower(School.url_name) == func.lower(query)).first()

        if school:
            return school.as_dict()
        else:
            return None

    @staticmethod
    def get_schools_urlname_list(urlname_list):
        result = School.query.filter(School.url_name.in_(urlname_list)).all()

        if result:
            school_list = []
            for i in range(len(result)):
                school_list.append(result[i].as_dict())
            
            return school_list
        else:
            return None

class Module(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    code = db.Column(db.String(50), unique=True)
    code_subject = db.Column(db.String(50))
    code_number = db.Column(db.String(50))
    school = db.Column(db.String(400))
    short_title = db.Column(db.String(2000))
    long_title = db.Column(db.String(4000))
    description = db.Column(db.String(4000))
    learning_outcomes = db.Column(db.String(4000))

    subject = db.Column(db.String(400))
    semester = db.Column(db.String(100))
    module_coordinator = db.Column(db.String(400))
    credits = db.Column(db.String(400))
    level = db.Column(db.String(50))
    compensation = db.Column(db.String(3000))
    resit_opps = db.Column(db.String(3000))
    remediation = db.Column(db.String(3000))
    pre_reqs = db.Column(db.String(3000))
    required = db.Column(db.String(2000))
    co_reqs = db.Column(db.String(2000))
    incompatibles = db.Column(db.String(2000))
    additional_info = db.Column(db.String(4000))
    equiv_modules = db.Column(db.String(3000))
    requirements = db.Column(db.String(3000))
    excluded = db.Column(db.String(3000))
    recommended = db.Column(db.String(3000))
    count_workload = db.Column(db.String(2000))
    count_assess = db.Column(db.String(2000))

    gensim_id = db.Column(db.Integer, unique=True)
    gensim_doc = db.Column(db.String(6000))

    def __init__(self, **kwargs):
        super(Module, self).__init__(**kwargs)

    def as_dict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    def get_modules_by_staff(staff_id):
        modules = Module.query.filter_by(module_coordinator=staff_id).all()

        module_list = []
        for i in range(len(modules)):
            module_list.append(modules[i].as_dict())

        return module_list
    

    @staticmethod
    def get_module_by_code(code):
        module = Module.query.filter_by(code=code).first()
        if module:
            return module.as_dict()
        else:
            return None

    @staticmethod
    def get_list_of_codes():
        result = Module.query.with_entities(Module.code, Module.code_subject, Module.code_number).all()
        return result

    @staticmethod
    def get_modules_gensim_list(gensim_ids):
        result = Module.query.filter(Module.gensim_id.in_(gensim_ids)).all()

        if result:
            return result
        else:
            return None

    @staticmethod
    def get_modules_code_list(code_list):
        result = Module.query.filter(Module.code.in_(code_list)).all()

        if result:
            module_list = []
            for i in range(len(result)):
                module_list.append(result[i].as_dict())
            
            return module_list
        else:
            return None

    @staticmethod
    def get_school(school_name):
        school_modules = Module.query.filter_by(school= school_name).all()
        
        if(school_modules):
            module_list = []
            for i in range(len(school_modules)):
                module_list.append(school_modules[i].as_dict())
            
            return module_list
        else:
            return None

    @staticmethod
    def search_lsi(query, num_docs):
        lsi_results = lsi_search.search(query, num_docs)

        if len(lsi_results) <= 0:
            return []

        search_modules = Module.get_modules_gensim_list(lsi_results.keys()) # use static method from model

        return_list = []
        for i in range(len(search_modules)):
            return_item = {}
            return_item['module'] = search_modules[i].as_dict()
            return_item['index'] = lsi_results[ return_item['module']['gensim_id'] ][0]
            return_item['match_weight'] = lsi_results [ return_item['module']['gensim_id'] ][1]
        
            return_list.append(return_item)

        return return_list

    @staticmethod
    def get_similar(query, num_docs):
        lsi_results = lsi_search.search(query, num_docs+1)

        if len(lsi_results) <= 0:
            return []

        search_modules = Module.get_modules_gensim_list(lsi_results.keys()) # use static method from model

        return_list = []
        for i in range(len(search_modules)):
            return_item = {}
            return_item['module'] = search_modules[i].as_dict()

            if return_item['module']['gensim_doc'] != query:
                return_item['index'] = lsi_results[ return_item['module']['gensim_id'] ][0]
                return_item['match_weight'] = lsi_results [ return_item['module']['gensim_id'] ][1]
            
                return_list.append(return_item)

        return return_list

