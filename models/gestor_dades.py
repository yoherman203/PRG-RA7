from models.models import PartidaModel
from models.mongo import partides_collection


class GestorDades:
	def __init__(self):
		self.partides_collection = partides_collection

	def guardar_partida(self, partida_obj: PartidaModel):
		self.partides_collection.insert_one(partida_obj)

	def carregar_resultats(self):
		return self.partides_collection.find()
