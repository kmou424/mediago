import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import isDev from "electron-is-dev";
import { inject, injectable } from "inversify";
import { resolve } from "path";
import { TYPES } from "../types";
import {
  DownloadProgress,
  LoggerService,
  MainWindowService,
} from "../interfaces";
import { event } from "helper/utils";

@injectable()
export default class MainWindowServiceImpl
  extends BrowserWindow
  implements MainWindowService
{
  constructor(
    @inject(TYPES.LoggerService)
    private readonly logger: LoggerService
  ) {
    const options: BrowserWindowConstructorOptions = {
      width: 1100,
      minWidth: 1100,
      height: 680,
      minHeight: 680,
      show: false,
      frame: true,
      webPreferences: {
        preload: resolve(__dirname, "./preload.js"),
      },
    };
    super(options);
  }

  init(): void {
    const url = isDev ? "http://localhost:8555/" : "mediago://index.html/";
    void this.loadURL(url);

    this.once("ready-to-show", this.readyToShow);
    event.on("download-progress", this.onDownloadProgress);
  }

  readyToShow = () => {
    this.show();
    isDev && this.webContents.openDevTools();
  };

  onDownloadProgress = (progress: DownloadProgress) => {
    this.webContents.send("download-progress", progress);
  };
}
