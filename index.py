from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import BaseConfig
from flask_bcrypt import Bcrypt
from pymongo import MongoClient

app = Flask(__name__, static_folder="./static/dist", template_folder="./static")
app.config.from_object(BaseConfig)
db = SQLAlchemy(app)
client = MongoClient(BaseConfig.MONGODB_URI)
mongo_db = client['ucd-modules']
bcrypt = Bcrypt(app)
