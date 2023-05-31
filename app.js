const express=require("express");
const bodyParser=require("body-parser");
// const date=require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();

// const work=[];
// const items=["Accept","Heal","Evolve"];



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-vasu:vasu07@cluster0.ckgythp.mongodb.net/todolistDB",{ useUnifiedTopology: true });

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name: "Welcome"
    })

const item2 = new Item({
    name: "HOME"
})

const item3 = new Item({
    name: "ALL"
})

const defaultItems=[item1,item2,item3];

const listSchema = {
    name : String,
    items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){  
  
 

 Item.find({}).then(function(foundItems){
 if(foundItems.length === 0){
    Item.insertMany(defaultItems)
 .then(function(){
  console.log("Success to todolistDB");
 })
 .catch(function(err){
  console.log(err);
 });
 res.redirect("/");
}
 else{
    res.render("list",{ listTitle: "Today", newlistitem:foundItems});

}
 

});

});
app.post("/",function(req,res){

    var itemname=req.body.newitem;
    var listName=req.body.list;

    const item = new Item({
        name: itemname
    })

 if(listName === "Today"){
    item.save();
    res.redirect("/");
 }
 else{
    List.findOne({name:listName})
    .then(function(foundlist){
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/"+listName);
    })
 }
    
   
})


app.post("/delete",function(req,res){
    const checkedId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today")
    {
    Item.findByIdAndRemove(checkedId)
    .then(function(){
        console.log("Successfully Delete");
        res.redirect("/");
    })
   }
   else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}})
    .then(function(foundlist){
             res.redirect("/"+listName);
    
    })
   }

    
})

app.get("/:customListName",function(req,res){
   const customListName = _.capitalize(req.params.customListName);
   
  List.findOne({name:customListName})
  .then(function(foundlist){
   if(!foundlist){
    const list =new List({
        name : customListName,
        items : defaultItems
       });
       list.save();
       res.redirect("/" + customListName);
    }
  else{
    res.render("list",{ listTitle: foundlist.name, newlistitem:foundlist.items});

}

});
});


app.get("/about",function(req,res){
    res.render("about");
})

app.listen(3000,function(){
 console.log("Server run in 3000 Port");
})