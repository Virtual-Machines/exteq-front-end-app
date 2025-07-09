import {createRouter, createWebHistory} from "vue-router";

const routes = [
    { path: '/sign-in',                 name: 'sign-in',    component: SignInComponent,             meta: { title: 'Sign-In' } },
    { path: '/sign-up',                 name: 'sign-up',    component: SignUpComponent,             meta: { title: 'Sign-Up' } },
    { path: '/',                        name: 'default',    redirect: '/home'}
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    // Set the page title
    let baseTitle = 'ExTEQ';
    document.title = `${baseTitle} | ${to.meta['title']}`;
    // Call the authentication guard
    authenticationGuard(to, from, next);
});

export default router;

