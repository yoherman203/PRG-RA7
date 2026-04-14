import csv

from flask import (
    Flask,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
)

from models.gestor_dades import GestorDades
from models.usuaris import Usuari

app = Flask(__name__)
gestor = GestorDades()
app.secret_key = "clau_secreta_ic_games_1r_daw"


@app.context_processor
def inject_usuari():
    """Fa que el usuari estigui disponible a totes les plantilles."""
    return {"usuari": session.get("usuari_actiu")}


@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        nom = request.form.get("username")
        clau = request.form.get("password")

        usuari_actual = Usuari(nom, clau)

        if usuari_actual.validar_acces():
            session["usuari_actiu"] = nom
            return redirect(url_for("home"))
        else:
            flash("Accés denegat: Credencials incorrectes.", "error")

    return render_template("login.html")


@app.route("/registre", methods=["GET", "POST"])
def registre():
    if request.method == "POST":
        nom = request.form.get("username")
        clau = request.form.get("password")

        nou_usuari = Usuari(nom, clau)

        if nou_usuari.guardar_en_json():
            flash("Registrat amb èxit, ja pots iniciar el protocol.", "success")
            return redirect(url_for("login"))
        else:
            flash("Error: L'identificador d'usuari ja està en ús.", "error")

    return render_template("registre.html")


@app.route("/home")
def home():
    if "usuari_actiu" in session:
        nom_usuari = session["usuari_actiu"]
        return render_template("home.html", usuari=nom_usuari)
    else:
        flash("Protocol de seguretat: Has d'iniciar sessió primer.", "error")
        return redirect(url_for("login"))


@app.route("/logout", methods=["POST"])
def logout():
    session.pop("usuari_actiu", None)
    flash("Sessió tancada correctament.", "success")
    return redirect(url_for("login"))


@app.route("/joc1")
def joc1():
    if "usuari_actiu" in session:
        return render_template("joc1.html", usuari=session["usuari_actiu"])
    else:
        flash("Protocol de seguretat: Identifica't per jugar.", "error")
        return redirect(url_for("login"))


@app.route("/joc2")
def joc2():
    if "usuari_actiu" in session:
        return render_template("joc2.html", username=session["usuari_actiu"])
    else:
        flash("Protocol de seguretat: Identifica't per jugar.", "error")
        return redirect(url_for("login"))


@app.route("/joc3")
def joc3():
    if "usuari_actiu" in session:
        return render_template("joc3.html", username=session["usuari_actiu"])
    else:
        flash("Protocol de seguretat: Identifica't per jugar.", "error")
        return redirect(url_for("login"))


@app.route("/finalitzar_joc", methods=["POST"])
def finalitzar_joc():
    dades = request.get_json()
    print(dades)
    username = dades.get("username") or session.get("usuari_actiu")
    puntuacio = int(dades.get("puntuacio", 0))
    joc_nom = dades.get("joc", "Joc")
    data = dades.get("data")
    errors = dades.get("errors", 0)
    resultat = {
        "username": username,
        "joc_nom": joc_nom,
        "puntuacio": puntuacio,
        "data_hora": data,
        "errors": errors,
    }
    gestor.guardar_partida(resultat)
    print(f"Partida finalitzada per {username}: {puntuacio} punts. Guardar a MongoDB")
    return jsonify({"status": "success"})


@app.route("/rankings")
def rankings():
    joc_seleccionat = request.args.get("joc", "Selecció en orde")
    dades_ranking = []
    ruta_fitxer = "dades/resultats.csv"

    try:
        with open(ruta_fitxer, mode="r", encoding="utf-8") as f:
            for row in csv.reader(f):
                if (
                    len(row) >= 4
                    and row[0].lower() != "usuari"
                    and row[1] == joc_seleccionat
                ):
                    dades_ranking.append([int(row[2]), row[0], row[3]])
    except FileNotFoundError:
        print(f"Avís: No s'ha trobat el fitxer {ruta_fitxer}")

    dades_ranking.sort(reverse=True)

    return render_template(
        "rankings.html",
        usuari=session.get("usuari_actiu"),
        dades=dades_ranking,
        joc_seleccionat=joc_seleccionat,
    )


if __name__ == "__main__":
    app.run(debug=True)
