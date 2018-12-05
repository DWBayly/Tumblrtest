#Tumblr Savior

This node script is set to save the likes and posts of a blog. 

It will save all photos. Text posts will lose all styling, but will keep their html structure, images and text. 
Audio files will be saved, but sound cloud links will not download. 
Videos will be saved, but youtube links will not download. 


$$ Getting Started 

To start off, visit https://www.tumblr.com/oauth/apps and register an application. Get your credentials and store them. 

You will also need to have Node installed, and git and a terminal. I recommend Git bash, as it comes with git. 
https://git-scm.com/downloads
https://nodejs.org/enhttps://nodejs.org/en

Clone, fork or download this repository, then, open a terminal in the project folder. 
Install all packages with:
```
npm i
```
Once you are set up, change the name of template.env to .env. Fill out all the sections. For blog, put in your blog's name. 

Run the program with: 
```
node tumblrsavior.js
```
The program will create directories for each post type that it supports, then run through all your likes and post and then download all the content. This should take a minimum of .5 seconds per post. 

Beware, this will take up a lot of space. 

When I did my last run, I had about 2700 posts, and it took up about 1.5 GB of space. 
