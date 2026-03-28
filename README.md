# 🔗 Link'em

Add links to web pages wherever you want!

# Usage

## Usage 1: Adding your own links

 - In your browser (with this plugin) select any text and right click it
 - From the list of options, select `Link'em: Create Link`
 - In the new little window that appears, customize your new link
	- Choose between `on text`, or `next to text`
	- In case of `next to text`, choose a name or icon to show
	- Create the link, using a format string like `http://to_website/query/{text_value}`
	- Select the conditions that need to be met to add this link, like: 'url start', 'xpath match', 'value match' etc.


## Usage 2: Importing link libraries

Im sure everybody would love a link from their delivery notice email to their product order page.
Or maybe one from 

Since maybe people would want these links, they can be shared.
Users can create 'link libraries'. A library consists of links, or sub libraries.
(implementation note to self: check for circular reference)
Users can search and upvote/downvote these libraries, and install them.
When they are installed, all active links in that library are added to the users links.
Also, every day the installed libraries get queried for changes to their links


# How To

## Link Format

To create link, you use a format string, like `http://to_website/query/{text_value}`
This would create a link to the url where {text_value} is filled with a value on render.

Available format values are:
 - `text_value`: the value of the selected text, or the word that was right-clicked if no text was selected
 - `url_segment:x`: The current website url you are on. 
 - `url_parameter:x`: The value of parameter `x` in the url of the current website


# Technical details

Made with React + TypeScript + Vite + crxjs
