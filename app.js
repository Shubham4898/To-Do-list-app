const express = require("express");
const body = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(body.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');


mongoose.connect("mongodb://localhost:27017/todoListDB",{useNewUrlParser : true});
mongoose.set('useFindAndModify', false);

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema );

const item1 = new Item({
  name: "Welcome to do List"
});

const item2 = new Item({
  name : "Hit the + button to add a new item"
});

const item3 = new Item({
  name : "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);


var today = new Date();
var options = {
  weekday :"long",
  day: "numeric",
  month : "long"

};
var day = today.toLocaleDateString("en-US",options);


app.get("/",function(req,res){


  Item.find({},function(err,foundItems){


    if(foundItems.length == 0){

      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Success");
        }
      });
      res.redirect("/");

    }
      else{
          res.render("List",{kindofday:day,newListItem:foundItems});
      }




  });


});

app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;

List.findOne({name: customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      const list = new List({
        name: customListName,
        items : defaultItems
      });

      list.save();
      res.redirect("/" + customListName);

    }
    else{

      res.render("list",{kindofday:foundList.name,newListItem:foundList.items});
    }
  }
});


;
});

app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.button;



  const item = new Item({
    name: itemName
  });


  if(listName == day)
  {
    item.save();
  res.redirect("/");

  }
else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}


});

app.post("/delete", function(req,res){
  const checkedid = req.body.checkbox;
  const name = req.body.listName;

  if(name == day){
  Item.findByIdAndRemove(checkedid,function(err){
    if(err){
      console.log(err);
    }
  });
  res.redirect("/");
}

else{
  List.findOneAndUpdate({name:name},{$pull:{items:{_id:checkedid}}},function(err,foundList){
   if(!err){
     res.redirect("/" + name);
   }

  });
}
});


app.listen(3000,function(){
  console.log("server is running on port 3000");
});
