import express from "express";
import { connectDb } from "./db/index.js";
import { webSocF } from "./websocket/server.js";

await connectDb();

webSocF();
