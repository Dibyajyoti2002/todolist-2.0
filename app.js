//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://dg02:Manga%4002@clustern.nfkt5ps.mongodb.net/todolistDB",{useNewUrlParser: true});

const itemSchema = (
  {
    name:String
  }
);

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"Eating Breakfast"
});

const item2 = new Item({
  name:"Going for a walk"
});

const item3 = new Item({
  name:"Studying"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items : [itemSchema]
}

const List = mongoose.model("List",listSchema);

/*List.deleteMany({name:"Home"},function(err){
  if(err)
  console.log("Error");
  else
  console.log("Successfully deleted ");
})*/

app.get("/", function(req, res) {

  Item.find(function(err,foundItems){
    if(foundItems.length==0){
      Item.insertMany(defaultItems,function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("Successfully saved all the items");
        }
      }
      ); 
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }

  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
    
  }
  
  
});

app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items:defaultItems
         });
         list.save();
         res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  });
  

});

app.post("/delete",function(req,res){
  const checkedItemid= req.body.cb;
  Item.findByIdAndRemove(checkedItemid,function(err){
    if(err)
    console.log("ERROR");
    else
    console.log("Succesfully deleted item from database");
    res.redirect("/")
  })
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started on port 3000");
});
