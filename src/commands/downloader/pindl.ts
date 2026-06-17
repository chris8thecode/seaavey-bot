import { createDownloader } from "./createDownloader";

export default createDownloader({
  name: "Pinterest DL",
  aliases: ["pinterestdl"],
  description: "Download media dari Pinterest",
  platform: "Pinterest",
  helpExample: "https://pin.it/...",
  endpoint: "/downloader/pinterest",
  mediaType: "auto",
});
