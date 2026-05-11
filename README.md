# 🔗 Link'em

Add links to web pages wherever you want!

# Description

Link'em allows you to add your own links to any website.

Those 2 tools you use at work that dont integrate with eachother? Link'em!

Comparing multiple websites, so you keep searching on both? Just Link'em!

If you want to replace the word Rick on every website you visit with a Rickroll... Weird request, but you can!

# Building

Made with NPM + WXT + React + TypeScript + TailwindCSS
 1. Install dependencies by running `npm i`.
 2. Build the code using `npm run build`, or create a zip for chrome or firefox using `npm run zip` or `npm run zip:firefox`.
 3. You can also run the plugin in development mode using `npm run dev`, this enables hot reloading.
(these instructions were tested on Windows, but should work on any system that supports `npm` as it does not use any native dependencies)

# Demo Ideas

 - IMDB to streaming service search
 - Books on Amazon to Goodreads links
 - Amazon to Google reviews link
 - Goodreads to bol.com

# Usage

## Usage #1: Adding your own links

The main usage of this extension is creating your own links in web pages.
To do this, follow these steps:

 - In your browser (with this plugin) select any text and right click it
 - From the list of options, select `Link'em: Create New Link`
 - In the new little window that appears, customize your new link
	 - Create the link, using a format string like `http://to_website/query/{text-value}`
	 - After clicking `save`, your new link will be stored on your device

Right after clicking save, and any other time you visit this website, the link will be
injected into the website (assuming conditions are met, like the selected element is still there)

## Usage 2: Importing link libraries

Im sure everybody would love a link from their delivery notice email to their product order page.
Or maybe those 2 websites your whole team uses could just be a bit better linked together.

Since maybe people would want these links, they can be shared.
Users can create 'link packages'. A packages consists of links and some meta information
When they are installed, all active links in that library are added to the users links.

FUTURE IDEA: Users can search and upvote/downvote these libraries, and install them.
Every day the installed libraries get queried for changes to their links,
though these should not be automatically installed! (for security reasons)

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

# Easily combining your app

Lets say you made a product (i.e. a grocery list app) that integrates with another website (i.e. a price checker site)

Now, adding a link from your app to the price checker website is easy since you control your app.

If you want a link the other way around, that is where linkem comes in.
On your website, you can add a button that uses the browser `linkem-import-link` message to instantly create a link from
the price checker website to your application. This way you decide which links to make, and users have an easy setup!

# Lisence

[Apache License 2.0](https://spdx.org/licenses/Apache-2.0.html)
