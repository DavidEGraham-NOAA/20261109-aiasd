import("https://esm.sh/@material/web@2.3.0/all.js?bundle").catch(() => {
	document.documentElement.classList.add("material-components-fallback");
});