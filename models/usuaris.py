import json
import os
from models.mongo import db

class Usuari:
    def __init__(self, username, password):
        self.username = username
        self.password = password

    def guardar_mongo(self):
        if self.existeix():
            return False

        usuaris_registrats = self.obtenir_tots_els_usuaris()
        usuaris_registrats[self.username] = self.password

        with open(ARXIU_JSON, mode='w', encoding='utf-8') as arxiu:
            json.dump(usuaris_registrats, arxiu, indent=4)

        return True

    def existeix(self):
        usuaris_registrats = self.obtenir_tots_els_usuaris()
        return self.username in usuaris_registrats

    def validar_acces(self):
        usuaris_registrats = self.obtenir_tots_els_usuaris()
        if self.username in usuaris_registrats:
            return usuaris_registrats[self.username] == self.password
        return False

    @staticmethod
    def obtenir_tots_els_usuaris():
        return db.usuaris.find()
