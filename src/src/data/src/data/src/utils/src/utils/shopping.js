export const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export function createEmptyMenu() {
  return {
    Lunes: "",
    Martes: "",
    Miércoles: "",
    Jueves: "",
    Viernes: ""
  };
}

export function buildShoppingList({
  recipes,
  menu,
  pantry,
  pantryMissing,
  manualItems
}) {
  const list = [];

  weekDays.forEach((day) => {
    const recipeName = menu[day];
    const recipe = recipes.find((item) => item.name === recipeName);

    if (!recipe) return;

    recipe.ingredients.forEach((ingredient) => {
      list.push({
        id: `recipe-${recipe.name}-${ingredient.name}-${ingredient.unit}`,
        name: ingredient.name,
        qty: Number(ingredient.qty) || 1,
        unit: ingredient.unit || "unidad",
        category: ingredient.category || "🛒 Otros",
        source: recipe.name
      });
    });
  });

  pantryMissing.forEach((name) => {
    const pantryItem = pantry.find((item) => item.name === name);

    list.push({
      id: `pantry-${name}`,
      name,
      qty: 1,
      unit: "unidad",
      category: pantryItem?.category || "🛒 Otros",
      source: "Despensa"
    });
  });

  manualItems.forEach((item) => {
    const name = typeof item === "string" ? item : item.name;

    list.push({
      id: `manual-${name}`,
      name,
      qty: 1,
      unit: "unidad",
      category: "🛒 Otros",
      source: "Manual",
      manual: true
    });
  });

  return mergeShoppingItems(list);
}

function mergeShoppingItems(list) {
  const grouped = {};

  list.forEach((item) => {
    const key = `${normalizeName(item.name)}-${item.unit}`;

    if (!grouped[key]) {
      grouped[key] = { ...item };
    } else {
      grouped[key].qty += Number(item.qty) || 1;
    }
  });

  return Object.values(grouped).sort((a, b) =>
    a.category.localeCompare(b.category)
  );
}

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

export function shoppingListToText(list) {
  return list
    .map((item) => `- ${item.category} ${item.name}: ${item.qty} ${item.unit}`)
    .join("\n");
}
