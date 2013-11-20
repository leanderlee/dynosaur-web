#!/bin/bash
cd ./repo
git init > /dev/null
git add index.html package.json web.js Procfile > /dev/null
git commit -m "Added index.html" > /dev/null
heroku create

git push heroku master > /dev/null
heroku ps:scale web=1 > /dev/null
rm -rf .git
