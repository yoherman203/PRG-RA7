from flask import Flask 

app = Flask(__name__) 

@app.route('/') 
def home():
    return "Hola des de app.py" 

if __name__ == '__main__':
    app.run(debug=True)     