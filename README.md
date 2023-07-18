## Quick start

The first things you need to do are cloning this repository and installing its
dependencies:

```sh
npm install 
or
npm install --legacy-peer-deps 
```

Once installed, let's run Hardhat's testing network:

```sh
npx hardhat node
```

Then, on a new terminal, go to the repository's root folder and run this to
deploy your contract:

```sh
npx hardhat run scripts/deploy.js --network localhost
```

### Frontend

```shell
cd ./frontend
npm install && npm run serve
```

### Backend

```sh
cd ./backend
npm install && npm run build:prod && npm run start:prod
```
