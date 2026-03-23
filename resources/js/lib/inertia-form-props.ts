type RouteLike = {
    url: string;
    method: string;
};

/**
 * Wayfinder genera rutas con forma `{ url, method }`.
 * Inertia `Form` necesita `{ action, method }`.
 */
export function inertiaFormProps(route: RouteLike) {
    return {
        action: route.url,
        method: route.method,
    };
}

