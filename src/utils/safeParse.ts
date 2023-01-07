export const safeParse = (value: string | null) => {
	if (value) {
		try {
			// try to parse as an object or number
			return JSON.parse(value);
		} catch {
			// if it's actually a string, return that
			return value;
		}
	}
	return undefined;
};
