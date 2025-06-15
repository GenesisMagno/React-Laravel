import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

export const startProgress = () => NProgress.start();
export const stopProgress = () => NProgress.done();
