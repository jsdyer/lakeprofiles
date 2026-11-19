export const fields = {
  oxygen: { name: "Dissolved oxygen", unit: "mg/L", index: 2 },
  temperature: { name: "Temperature", unit: "°C", index: 3 },
};
export const visitDates = (values) =>
  [...new Set(values.map((v) => v[0]))].sort();
export function atDepth(rows, day, depth, index) {
  return rows
    .filter((r) => r[0] === day && r[1] === depth && Number.isFinite(r[index]))
    .map((r) => r[index]);
}
export const format = (x) =>
  x.toLocaleString("en-CA", { maximumFractionDigits: 2 });
