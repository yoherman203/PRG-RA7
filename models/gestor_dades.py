import csv
import os
from models.entities import Resultat
from models.models import PartidaModel
from models.mongo import joc_dades_db

class GestorDades:
    def __init__(self):
        self.partides_collection = joc_dades_db.get_collection("partides")

    def guardar_partida(self, partida_obj):
        self.partides_collection.insert_one(partida_obj.model_dump())

    def carregar_resultats(self):
        """Devuelve una lista de objetos Resultat"""
        resultats = []
        if not os.path.exists(self.ruta_resultats):
            return resultats

        with open(self.ruta_resultats, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                if row:
                    resultats.append(Resultat(row[0], row[1], row[2], row[3]))
        return resultats
