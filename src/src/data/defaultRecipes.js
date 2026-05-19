export const defaultRecipes = [
  {
    name: "Hummus",
    emoji: "🥙",
    servings: 4,
    type: "Entrante",
    time: "10 min",
    tags: ["fácil", "vegetariana"],
    ingredients: [
      { name: "Garbanzos cocidos", qty: 400, unit: "g", category: "🥫 Conservas" },
      { name: "Tahini", qty: 2, unit: "cucharadas", category: "🛒 Otros" },
      { name: "Limón", qty: 1, unit: "unidad", category: "🍎 Frutas" },
      { name: "Aceite de oliva", qty: 2, unit: "cucharadas", category: "🫒 Aceites" }
    ]
  },
  {
    name: "Ensalada Shirazi",
    emoji: "🥗",
    servings: 4,
    type: "Ensalada",
    time: "15 min",
    tags: ["fresca", "rápida"],
    ingredients: [
      { name: "Pepino", qty: 1, unit: "unidad", category: "🥬 Verduras" },
      { name: "Tomate", qty: 3, unit: "unidades", category: "🥬 Verduras" },
      { name: "Cebolla morada", qty: 0.5, unit: "unidad", category: "🥬 Verduras" },
      { name: "Limón", qty: 1, unit: "unidad", category: "🍎 Frutas" }
    ]
  },
  {
    name: "Arroz blanco suelto",
    emoji: "🍚",
    servings: 4,
    type: "Guarnición",
    time: "20 min",
    tags: ["básico"],
    ingredients: [
      { name: "Arroz", qty: 300, unit: "g", category: "🌾 Cereales" },
      { name: "Agua", qty: 600, unit: "ml", category: "🛒 Otros" },
      { name: "Sal", qty: 1, unit: "pizca", category: "🌶️ Especias" }
    ]
  }
];
