import { Router } from "express";
import { keyController } from "./key.controller";

const keyRoutes = Router();

keyRoutes.get("/", (req, res) => keyController.getKeys(req, res));
keyRoutes.post("/", (req, res) => keyController.addKey(req, res));

export default keyRoutes;
