import Spinner from './Spinner.svelte';

export const loader = (node, loading) => {
	let Spin, loadingValue;
	const unsubscribe = loading.subscribe(loading => {
		const doingtext = "ok";
		if(loading){
			Spin = new Spinner({
				target: node,
				props: {},
				intro: true
			})
		} else {
			if(Spin){
				Spin?.$destroy?.()
				Spin = undefined;
			}
		}
	})
}

