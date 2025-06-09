export const removeItemFromList = (list, predicate, beforeRemove) => {
	const index = list.findIndex(predicate);
	let removedItem = null;
	if (index > -1) {
		removedItem = list[index];
		if (typeof beforeRemove === "function") {
			beforeRemove(removedItem);
		}
		list.splice(index, 1);
	} else {
		cc.error("removeItemFromList: Item not found in the list");
	}
	return removedItem;
};

export const findItemInList = (list, predicate, callback, mustHave = true) => {
	const foundItem = list.find(predicate);
	if (foundItem) {
		if (typeof callback === "function") {
			callback(foundItem);
		}
		return foundItem;
	} else if (mustHave) {
		cc.error("findItemInList: Item not found in the list");
	}
	return null;
};
