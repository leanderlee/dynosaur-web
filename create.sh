#!/bin/bash
cd ./repo
git init
git add index.html package.json web.js Procfile
git commit -m "Added index.html"
heroku create

git push heroku master
heroku ps:scale web=1
rm -rf .git
