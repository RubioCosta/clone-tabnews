import { createRouter } from "next-connect"
import database from "infra/database.js";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

const router = createRouter();

router.get(getHandler)

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler
});

function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError();
  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, req, res) {
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.log("\n Erro dentro do catch /status.")
  console.error(publicErrorObject);

  res.status(500).json(publicErrorObject);
}

async function getHandler(req, res) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseOpenedConnectionValue =
    databaseOpenedConnectionResult.rows[0].count;

  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: Number(databaseMaxConnectionsValue),
        opened_connections: databaseOpenedConnectionValue,
      },
    },
  });
}