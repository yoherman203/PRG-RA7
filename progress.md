Original prompt: haz algo simple en joc1.html

- `joc1.html`, `joc1.css` y `joc1.js` estaban vacíos.
- `app.py` todavía no expone una ruta para `joc1`.
- Se va a implementar un minijuego simple de clics con estilo coherente con `IC Games`, enlazado desde la home y con hooks de prueba (`render_game_to_text`, `advanceTime`).
- Implementado `Joc 1` como minijuego de clics con temporizador, objetivo de puntos, reinicio y estados de victoria/derrota.
- Añadida la ruta `/joc1` en Flask y enlazado el primer bloque de la home para abrir el juego.
- Pendiente: validación en navegador con Playwright y revisión visual final.
- Validado en navegador: la ruta `/joc1` carga, el contador baja, el botón suma puntos, el estado pasa a `won` al llegar a 20 y a `lost` cuando el tiempo llega a 0.
- Sin errores de consola detectados en la prueba visual.
- El usuario ha pedido convertir `Joc 1` a un juego de escribir palabras, con penalizacion al fallar y bonus al acertar.
- Se sustituye el juego de clics por uno de escritura y se anade un fichero `static/data/joc1-paraules.txt` como fuente externa de palabras.
- Validado en navegador: el juego carga palabras del `.txt`, un acierto suma tiempo y puntos, un fallo resta tiempo y cambia inmediatamente la palabra, y la derrota por tiempo funciona.
- Sin errores de consola durante la prueba del nuevo flujo de escritura.
- Ajustado el modo duro: `Backspace/Delete` quedan bloqueados y cualquier letra incorrecta dispara la penalizacion al instante sin esperar a `Enter`.
- Validado en navegador: el texto no se puede borrar y un fallo cambia automaticamente a otra palabra.
