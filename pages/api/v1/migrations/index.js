import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
  const pendingMigrations = await migrator.listPendingigrations();
  res.status(200).json(pendingMigrations);
}

async function postHandler(req, res) {
  const migratedMigrations = await migrator.runPendingMigrations();

  if (migratedMigrations.length > 0) {
    res.status(201).json(migratedMigrations);
  }

  res.status(200).json(migratedMigrations);
}
