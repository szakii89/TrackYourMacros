const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const func = require(__dirname + "/functions.js");

const app = express();
const capital = func.capitalize;

const foods = [];
const quantity = [];
const proteins = [];
const fats = [];
const carbs = [];
const calories = [];
const startValue = 0;
let dataBase = [];

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/macroDB", {
  useNewUrlParser: true
});

const foodsSchema = {
  name: {
    type: String,
    required: [true, 'Add a name for this food.']
  },
  proteins: {
    type: Number,
    required: [true, 'How much proteins are present in 100 grams of this food?'],
    min: 0,
    max: 100
  },
  fats: {
    type: Number,
    required: [true, 'How much fats are present in 100 grams of this food?'],
    min: 0,
    max: 100
  },
  carbohydrates: {
    type: Number,
    required: [true, 'How much carbohydrates are present in 100 grams of this food?'],
    min: 0,
    max: 100
  },
  calories: {
    type: Number,
    required: [true, 'How much calories are in 100 grams of this food?']
  },
  comment: String,
}

const Food = mongoose.model("Food", foodsSchema);

const banana = new Food({
  name: "Banana",
  proteins: 1.1,
  fats: 0.3,
  carbohydrates: 20.2,
  calories: 89
})

app.get("/", function(req, res) {
  var options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };
  var today = new Date();
  var todaySpec = today.toLocaleDateString("eng-US", options);

  res.render("foods", {
    thisDay: todaySpec,
    foods: foods,
    quantity: quantity,
    proteins: proteins,
    fats: fats,
    carbs: carbs,
    calories: calories,
    startValue: startValue,
  });
});

app.post("/", function(req, res) {
  const foodName = capital(req.body.foodName);
  const foodQuantity = Number(req.body.foodQuantity);

  Food.find({
    name: foodName
  }, function(err, foodMatch) {
    if (err) {
      console.log(err);
    } else if (foodMatch.length !== 0) {
      foods.push(foodMatch[0].name);
      quantity.push(foodQuantity);
      proteins.push(foodMatch[0].proteins * foodQuantity / 100);
      fats.push(foodMatch[0].fats * foodQuantity / 100);
      carbs.push(foodMatch[0].carbohydrates * foodQuantity / 100);
      calories.push(foodMatch[0].calories * foodQuantity / 100);
      console.log(foodQuantity);
      res.redirect("/");
    } else {
      console.log("Not Found.");
    }
  });
});

app.get("/macroDB", function(req, res) {
  // Food.updateOne({ "name" : "Coconut Oil"}, {"calories" : 862}, function(err) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("Updated!");
  //   }
  // });

  Food.find({}, function(err, foods) {
    if (err) {
      console.log(err);
    } else if (foods.length !== dataBase.length) {
      foods.forEach(function(food) {
        dataBase.push(food);
      });
    }
    res.render("macroDB", {dataBase: dataBase});
  }).sort({name: 1});
});

app.post("/macroDB", function(req, res) {
  const nameField = capital(req.body.newFoodName);
  const proteinField = req.body.newFoodProtein;
  const fatField = req.body.newFoodFat;
  const chField = req.body.newFoodCH;
  const kcalField = req.body.newFoodCalories;
  const commentField = capital(req.body.newFoodComment);

  Food.find({
    name: nameField
  }, function(err, foodMatch) {
    if (err) {
      console.log(err);
    } else if (foodMatch.length !== 0) {
      console.log("The " + nameField + " is already in the database.");
    } else {
      const newFood = new Food({
        name: nameField,
        proteins: proteinField,
        fats: fatField,
        carbohydrates: chField,
        calories: kcalField,
        comment: commentField
      });
      newFood.save();
      dataBase = [];
      console.log(nameField + " is added to the database successfully.");
    }
  });
  res.redirect("/macroDB");
});

app.post("/delete", function(req, res) {
  const itemToDelete = req.body.deleteButton;

  Food.deleteOne({name: itemToDelete}, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log(itemToDelete + " was deleted.");
      dataBase = [];
      res.redirect("/macroDB");
    }
  });
});

app.post("/update", function(req, res) {
  console.log(req.body.updateButton);
});

app.listen(4000, function() {
  console.log("Server is running at PORT 4000.");
})
