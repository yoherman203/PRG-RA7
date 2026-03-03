# PRG-RA7

## Preparació del entorn
Per a deixar preparat el entorn per a treballar el projecte es necessari seguir els seguients pasos per a que puguem traballar amb seguretat.

Necesitarem:
- Accés a un repositori
    - On posarem una carpeta **venv**, la qual aillarà el entorn per a no patir incopatibilitats mitjançant un entorn virtual.
    - També ha de comptar amb un **.gitignore** on estara tot el que volem evitar muntar el repositori.

- Python instal·lat amb:
    - Versió 3.8 o superior

### Activar el entorn virtual

Per activar el entorn virtual entrarem per al terminal de Windows i executarem la següent comanda dins del repositori:
```
python -m venv venv 
```
Això crearà una carpeta **venv**, la qual també generarà el arxiu **.gitignore**, el qual menejaem fora de **venv** per a que quede així:
```
Repo\
    venv\
    .gitignore
```
Un cop així, act