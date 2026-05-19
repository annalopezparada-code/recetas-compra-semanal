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
  const [recipes, setRecipes] = useState(() => loadFromStorage("recipes", defaultRecipes));
  const [menu, setMenu] = useState(() => loadFromStorage("menu", createEmptyMenu()));
  const [pantryMissing, setPantryMissing] = useState(() => loadFromStorage("pantryMissing", []));
  const [manualItems, setManualItems] = useState(() => loadFromStorage("manualItems", []));
  const [bought, setBought] = useState(() => loadFromStorage("bought", []));
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

  function saveRecipes(next) {
    setRecipes(next);
    saveToStorage("recipes", next);
  }

  function saveMenu(next) {
    setMenu(next);
    saveToStorage("menu", next);
  }

  function savePantryMissing(next) {
    setPantryMissing(next);
    saveToStorage("pantryMissing", next);
  }

  function saveManualItems(next) {
    setManualItems(next);
    saveToStorage("manualItems", next);
  }

  function saveBought(next) {
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

      saveRecipes([...recipes, recipe]);
      setRecipeText("");
      alert("Receta importada.");
    } catch {
      alert("No es un JSON válido.");
    }
  }

  function createSimpleRecipe() {
    const name = prompt("Nombre de la receta:");
    if (!name) return;

    const recipe = {
      name,
      emoji: "🍽️",
      servings: 4,
      type: "Principal",
      time: "30 min",
      tags: ["manual"],
      ingredients: []
    };

    saveRecipes([...recipes, recipe]);
  }

  function deleteRecipe(name) {
    if (!confirm(`¿Borrar ${name}?`)) return;
    saveRecipes(recipes.filter((recipe) => recipe.name !== name));
  }

  function exportBackup() {
    const data = { recipes, menu, pantryMissing, manualItems, bought };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert("Copia de seguridad copiada.");
  }

  function restoreBackup() {
    const raw = prompt("Pega aquí la copia de seguridad:");
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      saveRecipes(data.recipes || defaultRecipes);
      saveMenu(data.menu || createEmptyMenu());
      savePantryMissing(data.pantryMissing || []);
      saveManualItems(data.manualItems || []);
      saveBought(data.bought || []);
      alert("Copia restaurada.");
    } catch {
      alert("La copia no es válida.");
    }
  }

  function resetDemo() {
    if (!confirm("¿Reiniciar datos de prueba?")) return;
    saveRecipes(defaultRecipes);
    saveMenu(createEmptyMenu());
    savePantryMissing([]);
    saveManualItems([]);
    saveBought([]);
  }

  function copyShoppingList() {
    navigator.clipboard.writeText(shoppingListToText(shoppingList));
    alert("Lista copiada.");
  }

  function sendWhatsApp() {
    const text = shoppingListToText(shoppingList);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="app">
      <style>{styles}</style>

      <header>
        <h1>🍽️ Recetas y compra semanal</h1>
        <p>Recetas → Menú → Despensa → Lista sábado → Fanzines</p>
      </header>

      <nav>
        {["inicio", "recetas", "menú", "despensa", "sábado", "fanzines"].map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
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
          <Recipes
            recipes={recipes}
            recipeText={recipeText}
            onRecipeTextChange={setRecipeText}
            onCreateRecipe={createSimpleRecipe}
            onImportRecipe={importRecipe}
            onDeleteRecipe={deleteRecipe}
            onGoMenu={() => setTab("menú")}
          />
        )}

        {tab === "menú" && (
          <section>
            <h2>Menú semanal</h2>
            {weekDays.map((day) => (
              <div className="card" key={day}>
                <strong>{day}</strong>
                <select
                  value={menu[day]}
                  onChange={(event) =>
                    saveMenu({ ...menu, [day]: event.target.value })
                  }
                >
                  <option value="">Sin receta / sobras</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.name} value={recipe.name}>
                      {recipe.emoji} {recipe.name}
                    </option>
                  ))}
                </select>
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
                      savePantryMissing([...pantryMissing, item.name]);
                    } else {
                      savePantryMissing(pantryMissing.filter((name) => name !== item.name));
                    }
                  }}
                />
                <span>{item.category} {item.name}</span>
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
                  saveManualItems([...manualItems, newItem.trim()]);
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
                    if (event.target.checked) saveBought([...bought, item.id]);
                    else saveBought(bought.filter((id) => id !== item.id));
                  }}
                />
                <span className={bought.includes(item.id) ? "done" : ""}>
                  {item.category} {item.name}: {item.qty} {item.unit}
                </span>
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
            {recipes.map((recipe) => (
              <div className="cover" key={recipe.name}>
                <span>{recipe.emoji}</span>
                <h3>{recipe.name}</h3>
                <p>{recipe.type} · {recipe.time}</p>
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
    font-family: system-ui, sans-serif;
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

  nav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 12px;
    position: sticky;
    top: 0;
    background: #fffaf3;
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

  main {
    padding: 16px;
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

  textarea, input, select {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
    border-radius: 12px;
    border: 1px solid #fdba74;
    margin-top: 8px;
  }

  textarea {
    min-height: 120px;
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

  .cover {
    background: linear-gradient(135deg, #fb923c, #facc15);
    color: white;
    padding: 24px;
    border-radius: 24px;
    margin-bottom: 14px;
  }

  .cover span {
    font-size: 56px;
  }
`;

export default App;
