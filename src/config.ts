interface Config {
  name: string;
  prefix: string;
  owner: string;
}

export const config: Config = {
  name: "SeaaveyBot",
  prefix: "!",
  owner: process.env.OWNER_NUMBER ?? "6289513081052",
};
