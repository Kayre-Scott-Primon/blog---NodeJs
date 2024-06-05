const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const session = require("express-session");

const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const userConroller = require("./user/UserController");

const Category = require("./categories/Category");
const Article = require("./articles/Article");
const User = require("./user/User");

// view engine
app.set("view engine", "ejs");

// Redis
// para media e larga escala, para salvar as sessões

// sessions
app.use(
  session({
    secret: "ldflsjhfandmvnghqihewpife20845408rinf",
    cookie: { maxAge: 30000 },
  })
);

// static files
app.use(express.static("public"));

// body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// database
connection
  .authenticate()
  .then(() => {
    console.log("Conexão com o banco de dados realizada com sucesso!");
  })
  .catch((error) => {
    console.log(error);
  });

// routes
app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", userConroller);

app.get("/", (req, res) => {
  Article.findAll({
    order: [["id", "DESC"]],
    limit: 4,
  }).then((articles) => {
    Category.findAll().then((categories) => {
      res.render("index", { articles: articles, categories: categories });
    });
  });
});

app.get("/:slug", (req, res) => {
  let slug = req.params.slug;
  Article.findOne({
    where: { slug: slug },
  })
    .then((article) => {
      if (article != undefined) {
        Category.findAll().then((categories) => {
          res.render("article", { article: article, categories: categories });
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((error) => {
      res.redirect("/");
    });
});

app.get("/category/:slug", (req, res) => {
  var slug = req.params.slug;
  Category.findOne({
    where: {
      slug: slug,
    },
    include: [{ model: Article }],
  }).then((category) => {
    console.log("0", slug);
    if (category != undefined) {
      console.log("00");
      Category.findAll().then((categories) => {
        console.log("01");
        res.render("index", {
          articles: category.articles,
          categories: categories,
        });
      });
    } else {
      res.redirect("/");
    }
  });
});

app.listen(8080, () => {
  console.log("O servidor está funcionando...");
});
