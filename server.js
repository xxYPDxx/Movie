require("dotenv").config()
const express = require("express")
const app = express()
const path = require("path")
const logger = require("morgan")
const mongoose = require("mongoose")
const session = require("express-session")
var bodyParser = require("body-parser")
var fs = require("fs")

//Calling user
const User = require("./models/user")
const Admin = require("./models/admin")
var imgModel = require('./models/movie')
const Contact = require("./models/contact")
const Favourite = require("./models/favourite")
const Purchase = require("./models/purchase")
const Purchased = require("./models/purchased")
const bcrypt = require("bcryptjs")


//Use
app.use(express.static(path.join(__dirname, "public")))
app.use(logger("dev"))
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())


//Session
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
}))

//EJS 
app.set("view engine", "ejs")

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
}).then(() => console.log("DB connected"))
  .catch(error => console.log(error))


//Signup GET
app.get("/", (req, res) => {
    res.render("register.ejs")
    res.sendFile(__dirname, "register.ejs")
})

//Signup POST
app.post("/signup", async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            mobile: req.body.mobile
        })

        await user.save();
        console.log("User created")
        res.redirect("/signin")
    } catch {
        res.redirect("/")
    }
})


//Login GET
app.get("/signin", (req, res) => {
    res.render("login.ejs")
    res.sendFile(__dirname, "login.ejs")
})

//Login POST
app.post("/signin", async (req, res) => {
    await User.find({ email: req.body.email }).then(data => {
        const passmatch = bcrypt.compare(req.body.password, data[0].password)
        if(passmatch){
            req.session.user = data[0]
            res.redirect("/home")
        }
    }).catch(e => {
        console.log(e)
        res.send("Error at login")
    })
})

//home page get
app.get("/home", checkAuthentication , async (req,res) => {
    const holly = await imgModel.find({
        movietype:"Hollywood"
    })
    const bolly = await imgModel.find({
        movietype:"Bollywood"
    })
    res.render("home.ejs", {
        holly: holly,
        bolly: bolly
    })
})

//admin home get
app.get("/adminhome", checkAuthentication, async (req, res) => {
    const holly = await imgModel.find({
        movietype:"Hollywood"
    })
    const bolly = await imgModel.find({
        movietype:"Bollywood"
    })
    res.render("adminhome.ejs", {
        holly: holly,
        bolly: bolly
    })
})

//admin Get
app.get("/admin", checkAuthentication, (req, res) => {
    res.render("admin.ejs")
    res.sendFile(__dirname, "admin.ejs")
})

//admin post
app.post("/adminlogin", async (req, res) => {
    await Admin.find({ email: req.body.email }).then(data => {
        const passmatch = bcrypt.compare(req.body.password, data[0].password)
        if(passmatch){
            req.session.user = data[0]
            res.redirect("/adminhome")
        } else {
            res.send("Invalidlogin")
        }
    }).catch(e => {
        console.log(e)
        res.send("Error")
    })
})


app.get("/add", checkAuthentication, (req, res) => {
    res.render("add.ejs")
})

//add movie get
app.get("/", checkAuthentication, (req, res) => {
    imgModel.find({}, (er, items) => {
        if(er) {
            console.log(er)
            res.status(500).send("An error occured", er)
        } else {
            res.render('imagesPage', { items: items })
        }
    })
})

//storing files
var multer = require("multer")
const purchase = require("./models/purchase")
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
})
var upload = multer({ storage: storage })


//add movie post
app.post("/addmovie", upload.single("image"), (req, res, next) => {
    const obj = new imgModel({
        title: req.body.title,
        description: req.body.description,
        image: req.file.filename,
        length: req.body.length,
        price: req.body.price,
        movietype: req.body.movietype,
        genre: req.body.genre,
        date: req.body.date,
        rating: req.body.rating
    });
    obj.save();
    console.log(obj)
    res.redirect("/adminhome")
})


//adminmovie get
app.get("/adminmovie/:id", checkAuthentication, async (req, res) => {
    await imgModel.findById(req.params.id).then(det => {
        console.log(det)
        res.render("adminmovie.ejs", {
            detail: det
        })
    }).catch(e => {
        console.log(e)
        res.send("Error at display")
    })
})

//User movie details Get
app.get("/details/:id", checkAuthentication, async (req, res) => {
    await imgModel.findById(req.params.id).then(det => {
        console.log(det)
        res.render("details.ejs", {
            detail: det
        })
    }).catch(e => {
        console.log(e)
        res.send("Error at user display")
    })
})


// Favourite
app.post("/addtofavourite/:id" , upload.single('image'), async (req , res) => {
    await imgModel.findById(req.params.id).then(movie => {
        try{
            const favitem = new Favourite({ 
                userId: req.session.user._id,
                movieId: movie._id,
                fav_title: movie.title,
                fav_price: movie.price,
                fav_date: movie.date,
                fav_movietype: movie.movietype,
                fav_genre: movie.genre,
                fav_image: movie.image,
                fav_rating: movie.rating,
                fav_description: movie.description,
                fav_length: movie.length
            })
            favitem.save();
            res.redirect("/home")
        } catch (e) {
            console.log(e)
            res.send("error")
        }    
    })
})

// fav get
app.get("/dashboard", checkAuthentication, async (req, res) => {
    const fav = await Favourite.find({
        userId: req.session.user._id
    })
    const purchase = await Purchased.find({
        userId: req.session.user._id
    })
    res.render("dashboard.ejs", {
        favo: fav,
        pur: purchase
    })
})

//cart get
app.get("/cart", checkAuthentication, async (req, res) => {
    await Purchase.find({userId: req.session.user._id}).then(car => {
        var total = 0
        for (let i in car) {
            var temp = Number(car[i].buy_price)
            total += temp
        }
        res.render("cart.ejs", {
            cart: car,
            total: total
        })
    }).catch(e => {
        console.log(e)
        res.send("error at cart display")
    })
})

// cart
app.post("/addtocart/:id", upload.single('image'), async (req , res) => {
    await imgModel.findById(req.params.id).then(movie => {
        try{
            const buyitem = new Purchase({ 
                userId: req.session.user._id,
                movieId: movie._id,
                buy_title: movie.title,
                buy_price: movie.price,
                buy_date: movie.date,
                buy_movietype: movie.movietype,
                buy_genre: movie.genre,
                buy_image: movie.image,
                buy_rating: movie.rating,
                buy_description: movie.description,
                buy_length: movie.length
            })
            buyitem.save();
            res.redirect("/home")
            res.send("added to cart")
        } catch (e) {
            console.log(e)
            res.send("error")
        }    
    })
})

// movies purchased
app.post("/moviepurchased/:id" , upload.single('image'), async (req , res) => {
    await Purchase.findById(req.params.id).then(movie => {
        try{
            const puritem = new Purchased({ 
                userId: req.session.user._id,
                movieId: movie._id,
                pur_title: movie.title,
                pur_price: movie.price,
                pur_date: movie.date,
                pur_movietype: movie.movietype,
                pur_genre: movie.genre,
                pur_image: movie.image,
                pur_rating: movie.rating,
                pur_description: movie.description,
                pur_length: movie.length
            })
            puritem.save();
            res.redirect("/home")
        } catch (e) {
            console.log(e)
            res.send("error at movie purchase")
        }    
    })
})

//search
app.get("/search", checkAuthentication, (req , res) =>{
    detail = {},
    res.render("search.ejs", {
        detail: detail
    })
})

app.post("/search", function(req,res){
    var regex = new RegExp(req.body.title, 'i')
    imgModel.find({title: regex}).then((result)=>{
        res.render("search.ejs", {
            detail: result
        })
    })
})

//Edit
app.get("/edit/:id", checkAuthentication, async (req, res) => {
    console.log("Editing")
    await imgModel.findById(req.params.id).then(det => {
        console.log(det)
        res.render("edit.ejs", {
            detail: det
        })
    }).catch(e => {
        console.log(e)
        res.send("error at edit")
    })
})

//update
app.post("/update/:id", async (req, res) => {
    await imgModel.findOneAndUpdate({ _id: req.params.id }, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            length: req.body.length,
            price: req.body.price,
            rating: req.body.rating,
            date: req.body.date,
            // image: req.file.filename,
            genre: req.body.genre,
            movietype: req.body.movietype
        }
    }).then(result => {
        console.log(result)
        if(result) {
            res.redirect("/adminhome")
        } else {
            res.send("error while updating")
        }
    }).catch(e => {
        console.log(e)
        res.send("error in update")
    })
})

//Delete
app.post("/delete/:id", async (req, res) => {
    await imgModel.findOneAndDelete({_id: req.params.id }).then(result => {
        if(result){
            console.log("deleted")
            res.redirect("/adminhome")
        } else {
            res.send("error in delete else")
        }
    }).catch(e => {
        console.log(e)
        res.send("Error in delete")
    })
})

//remove cart
app.post("/remove/:id", async (req, res) => {
    await Purchase.findOneAndDelete({_id: req.params.id }).then(result => {
        if(result){
            console.log("removed")
            res.redirect("/cart")
        } else {
            res.send("error in remove else")
        }
    }).catch(e => {
        console.log(e)
        res.send("Error in remove")
    })
})

//remove fav
app.post("/removefav/:id", async (req, res) => {
    await Favourite.findOneAndDelete({_id: req.params.id }).then(result => {
        if(result){
            console.log("removed")
            res.redirect("/home")
        } else {
            res.send("error in remove else")
        }
    }).catch(e => {
        console.log(e)
        res.send("Error in remove")
    })
})

// Contact
app.get("/contact", checkAuthentication, (req,res)=>{
    res.render("contact.ejs")
})   

app.post("/contact", async(req,res)=>{
    try{
        const contact =new Contact({
        
         name: req.body.name,
           email:  req.body.email,
           phone: req.body.phone,
          review: req.body.review
        })
        await contact.save();
        res.redirect("/home")
    } catch(e){
        console.log(e)
        res.send("Error")
    }
})

// logout
app.post("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/")
})

function checkAuthentication(req, res, next) {
    if(req.session.user) {
        return next();
    } else {
        res.redirect("/")
    }
}

let port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Listening on port 3000")
})