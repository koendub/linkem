# 🔗 Link'em

Add links to web pages wherever you want!

# Usage

## Usage #1: Adding your own links

The main usage of this extension is creating your own links in web pages.
To do this, follow these steps:

 - In your browser (with this plugin) select any text and right click it
 - From the list of options, select `Link'em: Create New Link`
 - In the new little window that appears, customize your new link
	 - Choose between `on text`, or `next to text`
	 - In case of `next to text`, choose a name or icon to show
	 - Create the link, using a format string like `http://to_website/query/{text-value}`
	 - Select the conditions that need to be met to add this link, like: 'url start', 'xpath match', 'value match' etc.
	 - After clicking `save`, your new link will be stored on your device

Right after clicking save, and any other time you visit this website, the link will be
injected into the website (assuming conditions are met, like the selected element is still there)

## Usage 2: Importing link libraries

Im sure everybody would love a link from their delivery notice email to their product order page.
Or maybe those 2 websites your whole team uses could just be a bit better linked together.

Since maybe people would want these links, they can be shared.
Users can create 'link packages'. A packages consists of links and some meta information
When they are installed, all active links in that library are added to the users links.

FUTURE: Users can search and upvote/downvote these libraries, and install them.
Every day the installed libraries get queried for changes to their links, though these are not automatically installed! (security)


# How To

## Link Format

To create link, you use a format string, like `http://to_website/query/{text-value}`
This would create a link to the url where `{text-value}` is filled with the value of the selected text on render.
These formats can also take an argument, like `{url-param:id}` to fill with the id param of the url.

To check out the current other supported formats, check the `hrefReplacers` in `href.ts`.


## Sharing links

Locally:
 - Links are always stored in local storage.
 - Links can be shared using (base64 json) text.
 - Links can also be bundled together into a link package. These can also be shared via text.

Online:
 - Links can also 

# Technical details

Made with WXT + React + TypeScript + TailwindCSS
