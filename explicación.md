## Vista general: de la pàgina al CSV

El flux és sempre el mateix patró:

1. El joc en **JavaScript**, calcula la puntuació i quan vol “tancar” la partida fa un **POST** a una URL del servidor.
2. Flask dins del `app.py` rep aquest POST, llegeix el JSON i construeix un objecte Resultat.
3. `GestorDades` escriu una fila nova al fitxer `dades/resultats.csv`.

> [!IMPORTANT]
> No es guarda res fins que el JS crida explícitament aquesta ruta.

---
## 1. On es guarda el fitxer

| Element             | Ubicació                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Fitger de resultats | `dades/resultats.csv`                                                                                                                     |
| Cada línia          | Màxim quatre camps: `username`, `nom_del_joc`, `puntuacio`, `data_hora` (sense capçalera obligatòria; el codi simplement apendreix files) |

Exemple de dues files al CSV:

```CSV
maria,Selecció en orde,80,2026-03-24 15:30
joan,Flux de Paraules,12,2026-03-24 15:31
```

---
## 2. El model de dades: classe `Resultat`

En el fitxer: `models/entities.py`:

```python
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
```

- `__init__`: Guarda usuari, nom del joc, puntuació i, si no passes `data`, posa la data/hora actual (`YYYY-MM-DD HH:MM`).

- `to_csv_row()`: Retorna una llista de 4 valors llesta per escriure-la amb el mòdul `csv` de Python.

Exemple en Python:

```python
r = Resultat("anna", "Selecció en orde", 120)
r.to_csv_row() → ['anna', 'Selecció en orde', 120, '2026-03-24 16:45']
```

---
## 3. Encarregat d’escriure al CSV: `GestorDades.guardar_resultat`

En el fitxer `models/gestor_dades.py` està el `gestor_dades.py`

```python
def guardar_resultat(self, resultat_obj):
	"""Recibe un objeto Resultat y lo añade al histórico"""
	with open(self.ruta_resultats, mode='a', newline='', encoding='utf-8') as f:
		writer = csv.writer(f)
		writer.writerow(resultat_obj.to_csv_row())
```

> Recibe un objeto Resultat y lo añade al histórico

- `self.ruta_resultats` és `'dades/resultats.csv'`.
- `'a'` = mode “append”: no sobreescriu el fitxer; afegeix una fila al final.
- `newline=''` evita línies en blanc extranys amb CSV a Windows.
- `writerow(...)` utilitza el que retorna `resultat_obj.to_csv_row()`.

> [!NOTA]
Relació relacionada (lectura): `carregar_resultats()` llegeix el mateix CSV i torna llistes d’objectes `Resultat`, per el futur fer el ranking i la pàgina de “historial”.

---
## 4. Ruta HTTP: `finalitzar_joc`

En el fitxer `app.py`:

```python
@app.route('/finalitzar_joc', methods=['POST'])
def finalitzar_joc():
    dades = request.get_json()
    username = dades.get('username') or session.get('usuari_actiu')
    puntuacio = int(dades.get('puntuacio', 0))
    joc_nom = dades.get('joc', 'Joc')
    resultat = Resultat(username, joc_nom, puntuacio)
    gestor.guardar_resultat(resultat)
    print(f"Partida finalitzada per {username}: {puntuacio} punts. Guardat a resultats.csv")
    return jsonify({"status": "success"})
```

> El `print` és usat per a comprovar-ho per terminal, això només es veu en el servidor on s'executa.

Quadre de explicació:

|Pas|Funció / concepte|Descripció|
|---|---|---|
|`request.get_json()`|Flask|Llegeix el cos de la petició com a diccionari JSON.|
|`username`|—|Primer el que envia el client (`username`); si ve buit, el de la sessió `usuari_actiu`.|
|`puntuacio`|`int(...)`|Converteix a enter; si falta la clau, usa `0`.|
|`joc_nom`|`dades.get('joc', 'Joc')`|Nom del joc per al CSV (per defecte `"Joc"`).|
|`Resultat(...)`|Model|Crea l’objecte amb data automàtica.|
|`gestor.guardar_resultat(...)`|GestorDades|Afegeix la fila al CSV.|
|`jsonify({"status": "success"})`|Flask|Resposta JSON al navegador.|

> [!IMPORTANT]
A la part superior de `app.py` hi ha una instància global `gestor = GestorDades()` que usa aquesta funció.

---
## 5. Crida des del joc: exemple amb Joc 3

El fitxers `templates/joc3.html` injecta `usuari` al JS i `static/js/joc3.js`

El joc 3 primer assigna l’usuari en una variable global des del `template`. Quan l’usuari falla (esborra la seqüència) o acaba en el flux previst, es crida `finalitzarPartida()`:

`joc3.js`
```javascript
function finalitzarPartida() {
    fetch('/finalitzar_joc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: joc3Username,
            joc: "Selecció en orde",
            puntuacio: score
        })
    }).then(() => {
        window.location.href = "/home";
    });
}
```

- El `fetch` envia un POST a la mateixa aplicació (URL `/finalitzar_joc`).
- `JSON.stringify(...)` genera el cos, per exemple:

```json
{
	"username": "herman",
	"joc": "Selecció en orde",
	"puntuacio": 50
}
```

- Després de rebre la resposta, el navegador redirigeix a `/home`.

Exemple de seqüència completa:
1. Usuari acaba la partida amb `score = 50`.
2. `finalitzarPartida()` envia el JSON anterior.
3. `finalitzar_joc` crea `Resultat("herman", "Selecció en orde", 50)` amb data ara.
4. Es guarda al CSV una línia similar a: `herman,Selecció en orde,50,2026-03-24 16:02`
---
## 6. Resum de pressa

| On                                              | Què és                                                                                                                                                                      |
| :---------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Front (qualque `*.js`)                          | Al final de la partida: `fetch('/finalitzar_joc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, joc, puntuacio }) })` |
| `app.py` → `finalitzar_joc()`                   | Rep JSON, omple `Resultat`, crida el gestor                                                                                                                                 |
| `models/entities.py` → `Resultat`               | Model amb `to_csv_row()`                                                                                                                                                    |
| `models/gestor_dades.py` → `guardar_resultat()` | Obre `dades/resultats.csv` en mode append i escriu una fila                                                                                                                 |
| `dades/resultats.csv`                           | Històric brut de resultats                                                                                                                                                  |
