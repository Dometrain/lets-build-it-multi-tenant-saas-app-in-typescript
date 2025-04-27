# Let's Build It: Multi Tenanted SaaS App in TypeScript
## Front End

The starting point for the front end is a new [Vite](https://vite.dev/) application with most of the example code removed.  Start by cloning [section 1](/tree/section/01)

## Installation

```
npm install

# Initialize mocked service worker:
npx msw init public

# Install Playwright deps
npx playwright@latest install
npx playwright install-deps  
```


## Useful commands

* `npm run dev` Start the development server for the front end
* `npm run build` Build the frontend for production
* `npm run test` Run Playwright tests

## .env File

The `.env` file for the front end is creating automatically during deployment of the [FrontEndStack](../backend/README.md).  It will look like this:

```
VITE_DOMAIN_NAME=example.com
VITE_USER_POOL_ID=<YOUR_POOL_ID>
VITE_WEB_CLIENT_ID=<YOUR_CLIENT_ID>
VITE_STRIPE_PUBLIC_KEY=<YOUR_KEY>
VITE_MOCK_DATA=false
```

You can set `VITE_MOCK_DATA=true` to switch to the mocked API responses at any point.


