import datetime

class Usuari:
    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __str__(self):
        return f"Usuari: {self.username}"

class Joc:
    """Classe base per a tots els jocs"""
    def __init__(self, nom, tipus_interaccio):
        self.nom = nom
        self.tipus_interaccio = tipus_interaccio

class SessioJoc:
    """Controla una partida en curs"""
    def __init__(self, usuari, joc):
        self.usuari = usuari
        self.joc = joc
        self.inici_temps = datetime.datetime.now()
        self.intents = 0
        self.puntuacio = 0

    def calcular_temps_transcorregut(self):
        delta = datetime.datetime.now() - self.inici_temps
        return int(delta.total_seconds())

class Resultat:
    """Estructura per al guardat en CSV"""
    def __init__(self, username, joc_nom, puntuacio, data=None):
        self.username = username
        self.joc_nom = joc_nom
        self.puntuacio = puntuacio
        self.data = data if data else datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

    def to_csv_row(self):
        """Converteix l'objecte en una llista per al CSV"""
        return [self.username, self.joc_nom, self.puntuacio, self.data]

class JocAtrapar(Joc):
    def __init__(self):
        # Llamamos al constructor del padre (Joc)
        super().__init__(nom="Atrapa l'Objectiu", tipus_interaccio="Ratolí")
        self.objectius_totals = 10  # Por ejemplo, hay que atrapar 10
        self.velocitat_inicial = 2000 # ms
