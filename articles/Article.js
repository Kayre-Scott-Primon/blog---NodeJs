const Sequelize = require("sequelize");
const connection = require("../database/database");
const Category = require("../categories/Category");

const Article = connection.define("articles", {
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  body: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  slug: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

Category.hasMany(Article); // Uma categoria tem muitos artigos
Article.belongsTo(Category); // Um artigo pertence a uma categoria

// Article.sync({ force: true }); // force: true -> força a criação da tabela

module.exports = Article;
