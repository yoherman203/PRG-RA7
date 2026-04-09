import json
import os

ARXIU_JSON = 'dades/usuaris.json'

class Usuari:
    def __init__(self, username, password, anotacions="", vist=False):
        self.username = username
        self.password = password
        # Guardem les anotacions com a atribut privat
        self.__anotacions = anotacions
        # Guardem si l'usuari està marcat com a vist
        self.vist = vist

    def get_anotacions(self):
        return self.__anotacions

    def set_anotacions(self, anotacions):
        self.__anotacions = anotacions

    def get_vist(self):
        return self.vist

    def set_vist(self, vist):
        self.vist = vist

    def a_diccionari(self):
        # Preparem les dades per guardar-les en el fitxer JSON
        return {
            "password": self.password,
            "anotacions": self.get_anotacions(),
            "vist": self.get_vist()
        }

    def guardar_en_json(self):
        if self.existeix():
            return False 
            
        usuaris_registrats = self.obtenir_tots_els_usuaris()
        usuaris_registrats[self.username] = self.a_diccionari()
        
        with open(ARXIU_JSON, mode='w', encoding='utf-8') as arxiu:
            json.dump(usuaris_registrats, arxiu, indent=4) 
            
        return True

    def existeix(self):
        usuaris_registrats = self.obtenir_tots_els_usuaris()
        return self.username in usuaris_registrats

    def validar_acces(self):
        usuaris_registrats = self.obtenir_tots_els_usuaris()
        if self.username in usuaris_registrats:
            dades_usuari = usuaris_registrats[self.username]
            # Manté compatibilitat amb usuaris antics guardats només com a string.
            if isinstance(dades_usuari, str):
                return dades_usuari == self.password
            return dades_usuari.get("password") == self.password
        return False

    @classmethod
    def carregar_des_de_json(cls, username):
        # Carreguem un usuari amb totes les seues dades des del JSON.
        usuaris_registrats = cls.obtenir_tots_els_usuaris()
        dades_usuari = usuaris_registrats.get(username)

        if dades_usuari is None:
            return None

        if isinstance(dades_usuari, str):
            return cls(username, dades_usuari, "", False)

        return cls(
            username,
            dades_usuari.get("password", ""),
            dades_usuari.get("anotacions", ""),
            dades_usuari.get("vist", False)
        )

    @staticmethod
    def obtenir_tots_els_usuaris():
        if not os.path.exists('dades'):
            os.makedirs('dades')
            
        if os.path.exists(ARXIU_JSON):
            try:
                with open(ARXIU_JSON, mode='r', encoding='utf-8') as arxiu:
                    return json.load(arxiu)
            except json.JSONDecodeError:
                return {}
        return {}