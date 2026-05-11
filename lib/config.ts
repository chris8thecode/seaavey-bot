interface Config {
  name: string;
  prefix: string;
  owner: string;
  apiKey: string;
}

export const config: Config = {
  name: "SeaaveyBot",
  prefix: ".",
  owner: process.env.OWNER_NUMBER ?? "6289513081052",
  apiKey: process.env.API_KEY ?? "", // https://www.seaavey.com/apps/keys
};
