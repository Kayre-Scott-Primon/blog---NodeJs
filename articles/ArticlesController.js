const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Article");
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth");

router.get("/admin/articles", adminAuth.authenticate, (req, res) => {
  Article.findAll({
    include: [{ model: Category }],
  }).then((articles) => {
    res.render("admin/articles/index", { articles: articles });
  });
});

router.get("/admin/articles/new", adminAuth.authenticate, (req, res) => {
  Category.findAll().then((categories) => {
    res.render("admin/articles/new", { categories: categories });
  });
});

router.post("/admin/articles/save", adminAuth.authenticate, (req, res) => {
  var title = req.body.title;
  var body = req.body.body;
  var categoryId = req.body.category;

  Article.create({
    title: title,
    slug: slugify(title),
    body: body,
    categoryId: categoryId,
  }).then(() => {
    res.redirect("/admin/articles");
  });
});

router.post("/admin/articles/delete", adminAuth.authenticate, (req, res) => {
  var id = req.body.id;
  if (id != undefined) {
    if (!isNaN(id)) {
      Article.destroy({
        where: {
          id: id,
        },
      }).then(() => {
        res.redirect("/admin/articles");
      });
    } else {
      res.redirect("/admin/articles");
    }
  } else {
    res.redirect("/admin/articles");
  }
});

router.get("/admin/articles/edit/:id", adminAuth.authenticate, (req, res) => {
  var id = req.params.id;
  Article.findByPk(id)
    .then((article) => {
      if (article != undefined) {
        Category.findAll().then((categories) => {
          res.render("admin/articles/edit", {
            article: article,
            categories: categories,
          });
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((error) => {
      res.redirect("/");
    });
});

router.post("/admin/articles/update", adminAuth.authenticate, (req, res) => {
  var id = req.body.id;
  var title = req.body.title;
  var body = req.body.body;
  var category = req.body.vategory;

  Article.update(
    {
      title: title,
      body: body,
      categoryId: category,
      slug: slugify(title),
    },
    {
      where: {
        id: id,
      },
    }
  )
    .then(() => {
      res.redirect("/admin/articles");
    })
    .catch((error) => {
      res.redirect("/");
    });
});

router.get("/articles/page/:num", adminAuth.authenticate, (req, res) => {
  var page = req.params.num;
  var offset = 0;
  var quant = 4;

  if (isNaN(page) || page == 1) {
    offset = 0;
  } else {
    offset = (parseInt(page) - 1) * quant;
  }

  Article.findAndCountAll({
    limit: quant,
    offset: offset,
    order: [["id", "DESC"]],
  }).then((articles) => {
    var next;
    if (offset + quant >= articles.count) {
      next = false;
    } else {
      next = true;
    }

    var result = {
      articles: articles,
      next: next,
      page: parseInt(page),
    };

    Category.findAll().then((categories) => {
      res.render("admin/articles/page", {
        result: result,
        categories: categories,
      });
    });
  });
});

module.exports = router;
