export function getNextDisplayOrder(items = []) {
  const highestOrder = items.reduce((highest, item) => {
    const order = Number(item?.display_order ?? item?.displayOrder);
    return Number.isInteger(order) && order > highest ? order : highest;
  }, 0);

  return highestOrder + 1;
}