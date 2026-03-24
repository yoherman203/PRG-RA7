from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from models.usuaris import Usuari
from models.gestor_dades import GestorDades
from models.entities import Resultat

app = Flask(__name__)
gestor = GestorDades()
app.secret_key = 'clau_secreta_ic_games_1r_daw'

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        nom = request.form.get('username')
        clau = request.form.get('password')

        usuari_actual = Usuari(nom, clau)

        if usuari_actual.validar_acces():
            session['usuari_actiu'] = nom
            return redirect(url_for('home'))
        else:
            flash("Accés denegat: Credencials incorrectes.", "error")

    return render_template("login.html")


@app.route('/registre', methods=['GET', 'POST'])
def registre():
    if request.method == 'POST':
        nom = request.form.get('username')
        clau = request.form.get('password')

        nou_usuari = Usuari(nom, clau)

        if nou_usuari.guardar_en_json():
            flash("Registrat amb èxit, ja pots iniciar el protocol.", "success")
            return redirect(url_for('login'))
        else:
            flash("Error: L'identificador d'usuari ja està en ús.", "error")

    return render_template("registre.html")


@app.route('/home')
def home():
    if 'usuari_actiu' in session:
        nom_usuari = session['usuari_actiu']
        return render_template("home.html", usuari=nom_usuari)
    else:
        flash("Protocol de seguretat: Has d'iniciar sessió primer.", "error")
        return redirect(url_for('login'))




@app.route('/logout', methods=['POST'])
def logout():
    session.pop('usuari_actiu', None)
    flash("Sessió tancada correctament.", "success")
    return redirect(url_for('login'))


@app.route('/joc1')
def joc1():
    if 'usuari_actiu' in session:
        return render_template("joc1.html", username=session['usuari_actiu'])
    else:
        flash("Protocol de seguretat: Identifica't per jugar.", "error")
        return redirect(url_for('login'))

@app.route('/joc2')
def joc2():
    return render_template("joc2.html")



@app.route('/joc3')
def joc3():
    if 'usuari_actiu' in session:
        return render_template("joc3.html", username=session['usuari_actiu'])
    else:
        flash("Protocol de seguretat: Identifica't per jugar.", "error")
        return redirect(url_for('login'))


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


if __name__ == '__main__':
    app.run(debug=True)