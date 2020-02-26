In this guide, we will use React-ga that handles the Google Analytics tag and sends that data whenever there is a URL change by listening to the route changes.

## Step 1: Setup Google Analytics Property
We will first create a Google Analytics property and obtain the tracking ID
![google analytics](https://miro.medium.com/max/1433/1*MMMJfCF1_neXHY3xH98rkA.png)

## Step 2: Install React GA
React GA is a JavaScript module that can be used to include Google Analytics tracking code in a website or app that uses React for its front-end codebase.
Installation using npm:  
`npm install react-ga --save`
## Step 3: Import required modules
Now we would need to import the following modules from the Reach Router and the react-ga library in our App.js   
```
import { Router,createHistory,LocationProvider }from "@reach/router";   
import ReactGA from "react-ga";
```
## Step 4: Setup tracking Code
Initialize Google Analytics with the obtained tracking ID in the first step in the global scope just after the export in App.js . Also, declare const history globally that enables you to record the browser history. We will use the constant later.
```
ReactGA.initialize("UA-103xxxxx-xx"); 
const history= createHistory(window);
```
## Step 5: Handle the Routes
![](https://miro.medium.com/max/334/1*0iqfOci7_7Q8s2-wW1t3PQ.png)  
Now declare <LocationProvider history={history}> in return statement of your const App ifi function in App.js so that all components are inside it. This will help us listen to the URL’s as the route changes.
## Step 6: Send the Tracking Data
Now on every URL change using history.listen, we will trigger and send the data using ReactGA.pageview. For this, we will setup a function that listen to the history object and changes the value of ReactGA.pageview object inside the const APP ifi function in our app.js
```
history.listen( window => {
  ReactGA.pageview(window.location.pathname+ window.location.search);
  console.log('page=>',window.location.pathname);
}); 
```
Here `window.location.pathname` is the URL and window.location.search are the URL Params.
Your dinal setup in App.js should look something like this   
![](https://miro.medium.com/max/688/1*4FMrklT3bxfXCNbG4opjKA.png)

Run your code and you should be able to see the changes live in google analytics dashboard as you change the path.
## Bonus Step: Sending Aditional Info  
![](https://miro.medium.com/max/318/1*rStTIVfK4EEjNnT8fXpS8g.png)  
You can also send additional information using React.GA such as user ID, demographic, preference and other additional information and even on certain triggers using the same approach.
