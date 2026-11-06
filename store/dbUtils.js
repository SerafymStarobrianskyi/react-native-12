import * as SQLite from "expo-sqlite";

export const database = SQLite.openDatabase("dictionary.db");

async function run(sql, args = [], readOnly = false) {
  const [result] = await database.execAsync([{ sql, args }], readOnly);
  if (result.error) throw result.error;
  return result;
}

export async function init() {
  await database.transactionAsync(async (transaction) => {
    await transaction.executeSqlAsync(
      "CREATE TABLE IF NOT EXISTS words (word TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL);"
    );
    await transaction.executeSqlAsync(
      "CREATE TABLE IF NOT EXISTS theme (id INTEGER PRIMARY KEY NOT NULL, isDark INTEGER NOT NULL);"
    );
  });
}

export async function addWord(word) {
  await run("INSERT INTO words (word, data) VALUES (?, ?);", [word.word, JSON.stringify(word)]);
}

export async function updateWord(word) {
  await run("UPDATE words SET data = ? WHERE word = ?;", [JSON.stringify(word), word.word]);
}

export async function deleteWord(wordText) {
  await run("DELETE FROM words WHERE word = ?;", [wordText]);
}

export async function getWords() {
  const result = await run("SELECT data FROM words ORDER BY rowid;", [], true);
  return result.rows.map((row) => JSON.parse(row.data));
}

export async function getTheme() {
  const result = await run("SELECT isDark FROM theme WHERE id = 1;", [], true);
  return result.rows.length === 0 ? true : result.rows[0].isDark === 1;
}

export async function setTheme(isDark) {
  await run("INSERT OR REPLACE INTO theme (id, isDark) VALUES (1, ?);", [isDark ? 1 : 0]);
}
