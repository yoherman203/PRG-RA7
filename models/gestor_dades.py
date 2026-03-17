import csv
import os
from models.entities import Usuari, Resultat

class GestorDades:
    def __init__(self):
        # Rutas basadas en tu estructura de carpetas
        self.ruta_usuaris = 'dades/usuaris.csv'
        self.ruta_resultats = 'dades/resultats.csv'

    # --- Gestión de Usuarios ---
    def guardar_usuari(self, usuari_obj):
        """Recibe un objeto Usuari y lo escribe en el CSV"""
        with open(self.ruta_usuaris, mode='a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([usuari_obj.username, usuari_obj.password])

    def carregar_usuaris(self):
        """Lee el CSV y devuelve una lista de objetos Usuari"""
        usuaris = []
        if not os.path.exists(self.ruta_usuaris): return usuaris

        with open(self.ruta_usuaris, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                if row: usuaris.append(Usuari(row[0], row[1]))
        return usuaris

    # --- Gestión de Resultados ---
    def guardar_resultat(self, resultat_obj):
        """Recibe un objeto Resultat y lo añade al histórico"""
        with open(self.ruta_resultats, mode='a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(resultat_obj.to_csv_row())

    def carregar_resultats(self):
        """Devuelve una lista de objetos Resultat"""
        resultats = []
        if not os.path.exists(self.ruta_resultats): return resultats

        with open(self.ruta_resultats, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                if row: resultats.append(Resultat(row[0], row[1], row[2], row[3]))
        return resultats
