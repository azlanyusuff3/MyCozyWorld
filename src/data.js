export const PLACES = Object.freeze({
  town: { name: "Cozy Town", icon: "🗺️", caption: "A world of little discoveries." },
  home: { name: "Sunflower Home", icon: "🏡", caption: "Dress up, cook snacks and recharge." },
  school: { name: "Cozy School", icon: "📚", caption: "Read, study and make discoveries." },
  market: { name: "Berry Basket", icon: "🛒", caption: "Shop for groceries and delicious treats." },
  boutique: { name: "Petal Boutique", icon: "👗", caption: "Discover your own fashion style." },
  park: { name: "Cloudberry Park", icon: "🌷", caption: "Play and enjoy a little fresh air." }
});
export const ITEMS = Object.freeze({
  book: { name: "Storybook", icon: "📖", kind: "book", description: "A book full of adventures." },
  apple: { name: "Red Apple", icon: "🍎", kind: "food", cost: 6, hunger: 24, joy: 3, description: "Crunchy, sweet and refreshing." },
  milk: { name: "Strawberry Milk", icon: "🥛", kind: "food", cost: 9, hunger: 17, joy: 8, description: "A cute pink milk carton." },
  bun: { name: "Honey Bun", icon: "🥐", kind: "food", cost: 12, hunger: 33, joy: 5, description: "Fresh from the oven." },
  pear: { name: "Juicy Pear", icon: "🍐", kind: "food", cost: 7, hunger: 21, joy: 3, description: "A freshly picked pear." },
  daisy: { name: "Daisy", icon: "🌼", kind: "treasure", description: "A keepsake from the park." }
});
export const MARKET = ["apple", "milk", "bun", "pear"];
export const CLOTHES = Object.freeze({
  overalls: { name: "Sunny Overalls", icon: "🧸", cost: 0 },
  shirt: { name: "Everyday Tee", icon: "👕", cost: 0 },
  hoodie: { name: "Cloud Hoodie", icon: "🧥", cost: 16 },
  dress: { name: "Petal Dress", icon: "👗", cost: 18 }
});
export const LOOKS = Object.freeze({
  skin: ["#ffe0be", "#f3bf95", "#d79a6c", "#b97952", "#8c5942", "#603b30"],
  hair: ["bob", "curly", "spiky", "long", "pigtails", "short"],
  hairColor: ["#55392e", "#303044", "#9c5d40", "#eac66e", "#a24d62", "#a88bd0"],
  outfitColor: ["#f27e99", "#69bdae", "#739be1", "#e8b95c", "#ba94da", "#f29667"]
});
export const MISSIONS = Object.freeze([
  { id: "book", title: "A brand-new story", hint: "Visit Cozy School and pick up a storybook.", place: "school" },
  { id: "study", title: "Little bookworm", hint: "Use the school desk or read your storybook.", place: "school" },
  { id: "outfit", title: "Dress-up day", hint: "Try on a new look at Petal Boutique.", place: "boutique" },
  { id: "shop", title: "Market day", hint: "Buy a tasty treat at Berry Basket.", place: "market" },
  { id: "eat", title: "Snack break", hint: "Eat a snack from your backpack.", place: "home" },
  { id: "rest", title: "Home sweet home", hint: "Return home and rest in your bed.", place: "home" }
]);
