# Embedded Peaka Node Example

Sample node / express project to demonstrate Embedded Peaka UI integration and Peaka node client usage.
Project has backend and frontend implementations. Backend is implemented using Express framework.
Frontend is implemented with vite, react, tailwind and radix-ui.

You need to run backend and frontend together. Here is how you can do the setup for both of them:

## Backend Setup

Open a terminal go into backend folder.

```bash
cd backend
```

Copy the environment file example file:

```bash
cp .env.example .env
```

Replace `<YOUR_PARTNER_API_KEY>` with your own partner API Key. Then install required packages with commands below.

```bash
npm install
```

Then start express app with following command.

```bash
npm start
```

Your backend app should start running on port `3001`.

## Frontend Setup

Open a terminal go into frontend folder.

```bash
cd frontend
```

Install dependencies using npm then start project with commands below.

```bash
npm install
npm run dev
```

Your frontend app should start running on port `5173`

## Contact

For feature requests and bugs, please create an issue in this repo. For further support, see the following resources:

- [Peaka Community Discord](https://discord.com/invite/peaka)
