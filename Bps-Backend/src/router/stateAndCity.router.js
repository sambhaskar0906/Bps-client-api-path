import express from "express";
import {stateAndCities} from "../data/statesAndCities.js"


const router = express.Router();



router.get('/states', (req, res) => {
  const states = Object.keys(stateAndCities);
  res.json(states);
});


router.get('/cities/:state', (req, res) => {
  const state = req.params.state;
  const cities = stateAndCities[state];
  if (!cities) {
    return res.status(404).json({ message: "State not found" });
  }
  res.json(cities);
});

export default router;
