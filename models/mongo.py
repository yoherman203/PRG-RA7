import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

client = MongoClient(MONGODB_URL)
db = client.get_database("projecte_prg")
partides_collection = db.get_collection("partides")
