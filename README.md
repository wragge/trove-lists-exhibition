# Trove Lists Exhibition

This is a AngularJS web app that retrieves lists of resources collected in Trove Lists via the Trove API, and then displays them as a simple exhibition.

You can easily customise it to turn your own collection of lists into an exhibition.

See the [demo](http://keepsakes-lists-demo.herokuapp.com/#/).

## Setting things up.

Clone this repository into the folder of your choice.

Run the following to install the bits you need:

```
npm install
bower install
```

## Customising your exhibition

First get a Trove API key.

Open `index.html` in the editor of your choice.

Look for the 'EDIT THIS SECTION TO ADD YOUR EXHIBITION DETAILS' section.

Modify this to add your own exhibition name, tagline and description. Most importantly, edit the list of lists to include your own.

Insert your API key where you see `var troveAPIKey = "";`

## Generating your exhibition.

To view your exhibition locally:

```
grunt serve
````

To build your exhibition for publication:

```
grunt build
```

Once the build process is complete, your exhibition will be available in the `dist` directory. Just copy the contents of this directory to the webhost of your choice.
