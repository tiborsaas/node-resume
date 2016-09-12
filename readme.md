# Node resume
This projects helps to generate a PDF resume based on a JSON file. By default two designs are supplied.

[Check out my CV as an example](cv.pdf)

## Usage
Just edit a json, use the command line and you are ready to go. 
### Step 1
Edit the contents of the `data/cv.json` or just use the nullified `cv-empty.json` as a starter.
### Step 2
Type `npm start` in command line. That will render the default template called "basic". You can render other templates by adding the template name that you can find the the `views` folder. 

DONE :)

## Making changes to the template

For convinence, I've added a dev server that can be launched with the `npm start dev` command. `npm start dev [templatename]` will launch the desired template. 

### Important
If you make changes to the template, the dev server needs to be re-launhed.

## Used technologies
 * Twig template engine
 * html-pdf
 * Phantom JS
