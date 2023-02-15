export const newProxyProps = (initialProps: { [key: string]: any } = {}) => {
	// add effects to the initialProps
	initialProps['tram-effects'] = [];

	return new Proxy(initialProps, {
		get(obj, prop, reciever) {
			console.log('GET', { prop });
			return Reflect.get(obj, prop, reciever);
		},
		set(obj, prop, value, reciever) {
			console.log('SET', { prop, value });
			// if this is an effect that we are adding,
			// push it to the existing list of effects
			if (prop === 'tram-effect') {
				obj['tram-effects'].push(value);
				return true;
			}
			return Reflect.set(obj, prop, value, reciever);
		},
	});
};
