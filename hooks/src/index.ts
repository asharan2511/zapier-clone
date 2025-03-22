import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const client = new PrismaClient();
app.use(express.json());
app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  try {
    await client.$transaction(async (tx) => {
      const run = await client.zapRun.create({
        data: {
          zapId: zapId,
          metadata: body,
        },
      });

      await client.zapRunOutbox.create({
        data: {
          zapRunId: run.id,
        },
      });
    });

    //push it on to a queue (kafka/redis)

    res.json({ message: "Webhook Received" });
  } catch (error) {
    console.error(error);
  }
});

app.listen(3000, () => {
  console.log("Server started");
});
