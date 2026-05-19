import React from "react";

function Recipes({
  recipes,
  recipeText,
  onRecipeTextChange,
  onCreateRecipe,
  onImportRecipe,
  onDeleteRecipe,
  onGoMenu
}) {
  return (
    <section>
      <h2>Recetas</h2>

      <div className="grid">
        <button onClick={onCreateRecipe}>Nueva</button>
        <button onClick={onImportRecipe}>Importar JSON</button>
      </div>

      <textarea
        placeholder="Pega aquí una receta JSON generada por ChatGPT"
        value={recipeText}
        onChange={(event) => onRecipeTextChange(event.target.value)}
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
            <button onClick={onGoMenu}>Añadir al menú</button>
            <button onClick={() => onDeleteRecipe(recipe.name)}>Borrar</button>
          </div>
        </div>
      ))}
    </section>
  );
}

export default Recipes;
