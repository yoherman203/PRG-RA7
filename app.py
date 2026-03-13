from flask import Flask, render_template, request, redirect, url_for, jsonify, session # Hem afegit 'session'
from models.entities import Usuari, JocAtrapar, SessioJoc, Resultat
from models.gestor_dades import GestorDades

# 1. Configuració inicial
app = Flask(__name__)
app.secret_key = 'clave_secreta_para_seguridad'
gestor = GestorDades()

# 2. Rutes de navegació
@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        usuaris_registrats = gestor.carregar_usuaris()

        for u in usuaris_registrats:
            # Comprovació de seguretat bàsica
            if u.username == username and u.password == password:
                session['user'] = u.username  # Ara 'session' ja està importat
                print(f"✅ Accés permès: {u.username}")
                return redirect(url_for('home'))

        print("❌ Error: Usuari o contrasenya incorrectes")
    return render_template("login.html")

@app.route('/home')
def home():
    # Protecció: si no hi ha usuari a la sessió, torna al login
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template("home.html", username=session['user'])

@app.route('/registre', methods=['GET', 'POST'])
def registre():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if username and password:
            nou_usuari = Usuari(username, password)
            gestor.guardar_usuari(nou_usuari)
            print(f"✅ El pana {nou_usuari.username} se ha registrado con éxito.")
            return redirect(url_for('login'))
    return render_template("registre.html")

@app.route('/joc1')
def joc1():
    return render_template("joc1.html")

@app.route('/joc2')
def joc2():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template("joc2.html", username=session['user'])

@app.route('/joc3')
def joc3():
    return render_template("joc3.html")

# 4. Finalització de partida (API)
@app.route('/finalitzar_joc', methods=['POST'])
def finalitzar_joc():
    dades = request.get_json()
    username = dades.get('username', 'Convidat')
    joc_nom = dades.get('joc', 'Joc 2 (Chimpa)')
    puntuacio = dades.get('puntuacio', 0)

    nou_resultat = Resultat(username, joc_nom, puntuacio)
    gestor.guardar_resultat(nou_resultat)

    print(f"✅ Resultat guardat: {username} - {puntuacio} punts")
    return jsonify({"status": "success", "message": "Resultat guardat correctament"})

# 5. Execució del servidor
if __name__ == '__main__':
    app.run(debug=True)
