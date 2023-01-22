//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const { default: mongoose } = require("mongoose");
const mongoose = require("mongoose")
const _ = require("lodash")
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.set("strictQuery", false);

// below here is to use localhost3000 and local database
// mongoose.connect("mongodb://127.0.0.1:27017/toDoListDB", { useNewUrlParser: true })

// below here is to use mongodb database
mongoose.connect("mongodb+srv://admin-dimas:xxxnnnxxx@cluster0.8p1nc0i.mongodb.net/toDoListDB", { useNewUrlParser: true }, {useUnifiedTopology: true})



const itemsSchema = {
  name: String
}

const Item = mongoose.model(
  "Item",
  itemsSchema
)

const item1 = new Item({
  name: "Welcome to the To Do List App."
})

const item2 = new Item({
  name: "Hit the + button to add a new items."
})

const item3 = new Item({
  name: "<--- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved the data");
        }
      })
      res.redirect("/")
    } else {
      const day = date.getDate();
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  })
});

app.get("/:customListName", function (req, res) {
  // console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // create a new list here
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save()
        res.redirect("/" + customListName)
      } else {
        // show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  })
})

app.post("/", function (req, res) {

  const day = date.getDate();
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })

  if (listName === day){
    item.save()
    res.redirect("/")
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+listName)
    })
  }

});


app.post("/delete", function (req, res) {
  console.log(req.body.checkbox);
  const checkedId = req.body.checkbox
  const listName = req.body.listName
  const day = date.getDate();

if (listName === day){
  Item.findByIdAndRemove(checkedId, function (err) {
    if (!err) {
      console.log("successfully remove " + checkedId);
      res.redirect("/")
    }
  })
} else {
  List.findOneAndUpdate({name: listName}, {$pull:{items: {_id: checkedId}}}, function(err, foundList){
    if (!err){
      res.redirect("/"+ listName)
    }
  })
}
})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
