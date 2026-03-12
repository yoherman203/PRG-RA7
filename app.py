from flask import Flask, render_template, request, redirect, url_for, flash, session
from models.usuaris import Usuari

app = Flask(__name__)
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
            flash("Acceso denegado: Credenciales incorrectas.", "error")
            
    return render_template("login.html") 


@app.route('/registre', methods=['GET', 'POST'])
def registre():
    if request.method == 'POST':
        nom = request.form.get('username')
        clau = request.form.get('password')
        
        nou_usuari = Usuari(nom, clau)
        
        if nou_usuari.guardar_en_json():
            flash("Entidad registrada con éxito. Ya puedes iniciar protocolo.", "success")
            return redirect(url_for('login'))
        else:
            flash("Error: El identificador de usuario ya está en uso.", "error")

    return render_template("registre.html") 


@app.route('/home')
def home():
    if 'usuari_actiu' in session:
        nom_usuari = session['usuari_actiu']
        return render_template("home.html", usuari = nom_usuari)
    else:
        flash("Protocolo de seguridad: Debes iniciar sesión primero.", "error")
        return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)