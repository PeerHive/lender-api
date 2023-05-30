# PeerHive_API

This is a NodeJS backend supported by Express Module and MongoDB.

#Getting Started
Set up ENV with your database connection URL to the MongoDB Atlas
Your ENV parameter should be
1. CONNECTION_URL = Your Atlas connection url
2. JWT = Your JWT Token

then the code is connected to your Database with your connection

After that run the code
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:5000/hello_world](http://localhost:5000/hello_world) with your browser to see the result.

#Connection endpoint

1. [http://localhost:5000/main/landing](http://localhost:5000/main/landing) 
this is a GET request, you obtain the mainpage overview from the database.
2. [http://localhost:5000/main/pool](http://localhost:5000/main/landing)
this is a GET request, you will require the parameter for pool_id (ex: pool_000001).
you will obtain the overview from the database regarding a specific loan pool.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Node.js Documentation](https://nodejs.org/en/docs) - learn about Node.js features.
