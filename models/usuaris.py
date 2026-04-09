import json
import os

ARXIU_JSON = 'dades/usuaris.json'
# <--- Aquí empiezan los cambios --->
def _entrada_json_a_diccionari(valor):
    if isinstance(valor, str):
        return {'password': valor, 'anotacions': '', 'vist': False}
    if isinstance(valor, dict):
        return {
            'password': str(valor.get('password', '')),
            'anotacions': str(valor.get('anotacions', '') or ''),
            'vist': bool(valor.get('vist', False)),
        }
    return {'password': '', 'anotacions': '', 'vist': False}
# <--- Aquí terminan los cambios --->

# <--- Aquí empiezan los cambios --->
class Usuari:
    def __init__(self, username, password, anotacions='', vist=False):
        self.username = username
        self.password = password
        self.__anotacions = str(anotacions) if anotacions is not None else ''
        self.vist = bool(vist)

    @property
    def anotacions(self):
        return self.__anotacions

    @anotacions.setter
    def anotacions(self, valor):
        self.__anotacions = str(valor) if valor is not None else ''

    def a_dict_emmagatzematge(self):
        """Representació que es persisteix a usuaris.json per aquest usuari."""
        return {
            'password': self.password,
            'anotacions': self.__anotacions,
            'vist': self.vist,
        }
# <--- Aquí terminan los cambios --->

    def guardar_en_json(self):
        if self.existeix():
            return False

        usuaris_registrats = self.obtenir_tots_els_usuaris()
        usuaris_registrats[self.username] = self.a_dict_emmagatzematge()

        with open(ARXIU_JSON, mode='w', encoding='utf-8') as arxiu:
            json.dump(usuaris_registrats, arxiu, indent=4, ensure_ascii=False)

        return True

    def existeix(self):
        usuaris_registrats = self.obtenir_tots_els_usuaris()
        return self.username in usuaris_registrats

    def validar_acces(self):
# Compara la contrasenya amb el fitxer (format antic o nou).
        usuaris_registrats = self.obtenir_tots_els_usuaris()
        if self.username not in usuaris_registrats:
            return False
        dades = _entrada_json_a_diccionari(usuaris_registrats[self.username])
        return dades['password'] == self.password

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

# <--- Aquí empiezan los cambios --->
    @staticmethod
    def obtenir_dades_usuari(username):
#   Retorna dict normalitzat (password, anotacions, vist) o None si no existeix.
#   Útil per a vistes (per exemple home) sense exposar la contrasenya al template.

        if not username:
            return None
        tots = Usuari.obtenir_tots_els_usuaris()
        if username not in tots:
            return None
        d = _entrada_json_a_diccionari(tots[username])
        return {
            'anotacions': d['anotacions'],
            'vist': d['vist'],
        }
# <--- Aquí terminan los cambios --->
