import React, { useMemo, useState } from "react";
import Home from "./components/Home";
import Recipes from "./components/Recipes";
import { defaultRecipes } from "./data/defaultRecipes";
import { defaultPantry } from "./data/pantry";
import { loadFromStorage, saveToStorage } from "./utils/storage";
import {
  buildShoppingList,
  createEmptyMenu,
  shoppingListToText,
  weekDays
} from "./utils/shopping";

function App() {
  const [tab, setTab] = useState("inicio");
  const [recipes, setRecipes] = useState(() =>
    loadFromStorage("recipes", defaultRecipes)
  );
  const [menu, setMenu] = useState(() =>
    loadFromStorage("menu", createEmptyMenu())
  );
  const [pantryMissing, setPantryMissing] = useState(() =>
    loadFromStorage("pantryMissing", [])
  );
  const [manualItems, setManualItems] = useState(() =>
    loadFromStorage("manualItems", [])
  );
  const [bought, setBought] = useState(() =>
    loadFromStorage("bought", [])
  );
  const [recipeText, setRecipeText] = useState("");
  const [newItem, setNewItem] = useState("");

  const shoppingList = useMemo(() => {
    return buildShoppingList({
      recipes,
      menu,
      pantry: defaultPantry,
      pantryMissing,
      manualItems
    });
  }, [recipes, menu, pantryMissing, manualItems]);

  function updateRecipes(next) {
    setRecipes(next);
    saveToStorage("recipes", next);
  }

  function updateMenu(next) {
    setMenu(next);
    saveToStorage("menu", next);
  }

  function updatePantryMissing(next) {
    setPantryMissing(next);
    saveToStorage("pantryMissing", next);
  }

  function updateManualItems(next) {
    setManualItems(next);
    saveToStorage("manualItems", next);
  }

  function updateBought(next) {
    setBought(next);
    saveToStorage("bought", next);
  }

  function importRecipe() {
    try {
      const recipe = JSON.parse(recipeText);

      if (!recipe.name || !Array.isArray(recipe.ingredients)) {
        alert("La receta necesita name e ingredients.");
        return;
      }

      updateRecipes([...recipes, recipe]);
      setRecipeText("");
      alert("Receta importada.");
    } catch {
      alert("No es un JSON válido.");
    }
  }

  function createSimpleRecipe() {
    const name = prompt("Nombre de la receta:");
    if (!name) return;

    const ingredientsRaw = prompt(
      "Ingredientes, uno por línea:\nHuevos; 4; unidades; 🥚 Nevera"
    );

    const ingredients = (ingredientsRaw || "")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [ingredientName, qty, unit, category] = line
          .split(";")
          .map((item) => item.trim());

        return {
          name: ingredientName,
          qty: Number(qty) || 1,
          unit: unit || "unidad",
          category: category || "🛒 Otros"
        };
      });

    const recipe = {
      name,
      emoji: "🍽️",
      servings: 4,
      type: "Principal",
      time: "30 min",
      tags: ["manual"],
      ingredients
    };

    updateRecipes([...recipes, recipe]);
  }

  function deleteRecipe(name) {
    if (!confirm(`¿Borrar ${name}?`)) return;
    updateRecipes(recipes.filter((recipe) => recipe.name !== name));
  }

  function copyShoppingList() {
    navigator.clipboard.writeText(shoppingListToText(shoppingList));
    alert("Lista copiada.");
  }

  function sendWhatsApp() {
    const text = shoppingListToText(shoppingList);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function exportBackup() {
    const data = {
      recipes,
      menu,
      pantryMissing,
      manualItems,
      bought
    };

    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert("Copia de seguridad copiada.");
  }

  function restoreBackup() {
    const raw = prompt("Pega aquí la copia de seguridad:");
    if (!raw) return;

    try {
      const data = JSON.parse(raw);

      updateRecipes(data.recipes || defaultRecipes);
      updateMenu(data.menu || createEmptyMenu());
      updatePantryMissing(data.pantryMissing || []);
      updateManualItems(data.manualItems || []);
      updateBought(data.bought || []);

      alert("Copia restaurada.");
    } catch {
      alert("La copia no es válida.");
    }
  }

  function resetDemo() {
    if (!confirm("¿Reiniciar datos de prueba?")) return;

    updateRecipes(defaultRecipes);
    updateMenu(createEmptyMenu());
    updatePantryMissing([]);
    updateManualItems([]);
    updateBought([]);
  }

  return (
    <div className="app">
      <style>{styles}</style>

      <header>
        <h1>🍽️ Recetas y compra semanal</h1>
        <p>Recetas → Menú → Despensa → Lista sábado → Fanzines</p>
      </header>

      <nav>
        {["inicio", "recetas", "menú", "despensa", "sábado", "fanzines"].map(
          (item) => (
            <button
              key={item}
              className={tab === item ? "active" : ""}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          )
        )}
      </nav>

      <main>
       {tab === "inicio" && (
  <Home
    menu={menu}
    onGoShopping={() => setTab("sábado")}
    onGoMenu={() => setTab("menú")}
    onExportBackup={exportBackup}
    onRestoreBackup={restoreBackup}
    onResetDemo={resetDemo}
  />
)}

        {tab === "recetas" && (
          <section>
            <h2>Recetas</h2>

            <div className="grid">
              <button onClick={createSimpleRecipe}>Nueva</button>
              <button onClick={importRecipe}>Importar JSON</button>
            </div>

            <textarea
              placeholder="Pega aquí una receta JSON generada por ChatGPT"
              value={recipeText}
              onChange={(event) => setRecipeText(event.target.value)}
            />

            {recipes.map((recipe) => (
              <div className="card" key={recipe.name}>
                <h3>
                  {recipe.emoji} {recipe.name}
                </h3>
                <p>
                  {recipe.type} · {recipe.time} · {recipe.servings} raciones
                </p>
                <p>{recipe.tags?.join(", ")}</p>

                <details>
                  <summary>Ingredientes</summary>
                  {recipe.ingredients.map((ingredient, index) => (
                    <p key={index}>
                      {ingredient.category} {ingredient.name}: {ingredient.qty}{" "}
                      {ingredient.unit}
                    </p>
                  ))}
                </details>

                <div className="grid">
                  <button onClick={() => setTab("menú")}>Añadir al menú</button>
                  <button onClick={() => deleteRecipe(recipe.name)}>Borrar</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === "menú" && (
          <section>
            <h2>Menú semanal</h2>

            {weekDays.map((day) => (
              <div className="card" key={day}>
                <label>
                  <strong>{day}</strong>
                  <select
                    value={menu[day]}
                    onChange={(event) =>
                      updateMenu({
                        ...menu,
                        [day]: event.target.value
                      })
                    }
                  >
                    <option value="">Sin receta / sobras</option>
                    {recipes.map((recipe) => (
                      <option key={recipe.name} value={recipe.name}>
                        {recipe.emoji} {recipe.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
          </section>
        )}

        {tab === "despensa" && (
          <section>
            <h2>Despensa</h2>
            <p>Marca lo que falta. Pasará a la lista del sábado.</p>

            {defaultPantry.map((item) => (
              <label className="row" key={item.name}>
                <input
                  type="checkbox"
                  checked={pantryMissing.includes(item.name)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      updatePantryMissing([...pantryMissing, item.name]);
                    } else {
                      updatePantryMissing(
                        pantryMissing.filter((name) => name !== item.name)
                      );
                    }
                  }}
                />
                <span>
                  {item.category} {item.name}
                </span>
              </label>
            ))}
          </section>
        )}

        {tab === "sábado" && (
          <section>
            <h2>Lista sábado</h2>

            <div className="card">
              <input
                placeholder="Añadir producto puntual"
                value={newItem}
                onChange={(event) => setNewItem(event.target.value)}
              />
              <button
                onClick={() => {
                  if (!newItem.trim()) return;
                  updateManualItems([...manualItems, newItem.trim()]);
                  setNewItem("");
                }}
              >
                Añadir
              </button>
            </div>

            {shoppingList.map((item) => (
              <div className="row" key={item.id}>
                <input
                  type="checkbox"
                  checked={bought.includes(item.id)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      updateBought([...bought, item.id]);
                    } else {
                      updateBought(bought.filter((id) => id !== item.id));
                    }
                  }}
                />
                <span className={bought.includes(item.id) ? "done" : ""}>
                  {item.category} {item.name}: {item.qty} {item.unit}
                </span>

                {item.manual && (
                  <button
                    className="small"
                    onClick={() =>
                      updateManualItems(
                        manualItems.filter((manualItem) => manualItem !== item.name)
                      )
                    }
                  >
                    borrar
                  </button>
                )}
              </div>
            ))}

            <div className="grid">
              <button onClick={copyShoppingList}>Copiar lista</button>
              <button onClick={sendWhatsApp}>WhatsApp</button>
            </div>
          </section>
        )}

        {tab === "fanzines" && (
          <section>
            <h2>Fanzines</h2>
            <p>Galería demo visual de recetas.</p>

            {recipes.map((recipe) => (
              <div className="fanzine" key={recipe.name}>
                <div className="cover">
                  <span>{recipe.emoji}</span>
                  <h3>{recipe.name}</h3>
                  <p>{recipe.type}</p>
                  <p>{recipe.time}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

const styles = `
  body {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #fff7ed;
    color: #1f2937;
  }

  .app {
    max-width: 520px;
    margin: 0 auto;
    min-height: 100vh;
    background: #fffaf3;
  }

  header {
    padding: 20px;
    background: #fb923c;
    color: white;
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
  }

  header h1 {
    margin: 0;
    font-size: 24px;
  }

  header p {
    margin-bottom: 0;
    opacity: 0.95;
  }

  nav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 12px;
    position: sticky;
    top: 0;
    background: #fffaf3;
    z-index: 5;
  }

  button {
    border: 0;
    background: #fed7aa;
    padding: 10px 12px;
    border-radius: 14px;
    font-weight: 700;
    color: #7c2d12;
  }

  button.active {
    background: #fb923c;
    color: white;
  }

  button.small {
    padding: 6px 8px;
    font-size: 12px;
  }

  main {
    padding: 16px;
  }

  h2 {
    margin-top: 0;
  }

  .card {
    background: white;
    padding: 14px;
    border-radius: 18px;
    margin-bottom: 12px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 12px 0;
  }

  textarea {
    width: 100%;
    min-height: 120px;
    box-sizing: border-box;
    border-radius: 14px;
    border: 1px solid #fdba74;
    padding: 10px;
    margin-bottom: 12px;
  }

  input, select {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
    border-radius: 12px;
    border: 1px solid #fdba74;
    margin-top: 8px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: white;
    padding: 10px;
    border-radius: 14px;
    margin-bottom: 8px;
  }

  .row input[type="checkbox"] {
    width: auto;
    margin: 0;
  }

  .done {
    text-decoration: line-through;
    opacity: 0.5;
  }

  .fanzine {
    margin-bottom: 14px;
  }

  .cover {
    background: linear-gradient(135deg, #fb923c, #facc15);
    color: white;
    padding: 24px;
    border-radius: 24px;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    box-shadow: 0 10px 24px rgba(0,0,0,0.14);
  }

  .cover span {
    font-size: 56px;
  }

  .cover h3 {
    font-size: 28px;
    margin: 8px 0;
  }
`;

export default App;
