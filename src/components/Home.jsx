import React from "react";
import { weekDays } from "../utils/shopping";

function Home({
  menu,
  onGoShopping,
  onGoMenu,
  onExportBackup,
  onRestoreBackup,
  onResetDemo
}) {
  return (
    <section>
      <h2>Inicio</h2>

      <div className="card">
        <h3>Resumen de semana</h3>
        {weekDays.map((day) => (
          <p key={day}>
            <strong>{day}:</strong> {menu[day] || "Sin receta / sobras"}
          </p>
        ))}
      </div>

      <div className="grid">
        <button onClick={onGoShopping}>Ver compra</button>
        <button onClick={onGoMenu}>Organizar menú</button>
        <button onClick={onExportBackup}>Copia de seguridad</button>
        <button onClick={onRestoreBackup}>Restaurar copia</button>
        <button onClick={onResetDemo}>Reiniciar demo</button>
      </div>
    </section>
  );
}

export default Home;
