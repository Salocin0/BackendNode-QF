import cron from "node-cron";
import { eventoService } from "../services/evento.service.js";

export function procesosAutomaticos(){
    cron.schedule("* * * * *", () => {
        eventoService.istime();
      });
}