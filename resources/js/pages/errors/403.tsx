import TechErrorView from '@/components/errors/TechErrorView';

export default function Error403() {
    return (
        <TechErrorView
            statusCode={403}
            title="Acceso restringido"
            description="No tienes permisos para acceder a este recurso. Tu sesión está activa, pero esta sección requiere un nivel de autorización distinto."
            hint="Si crees que esto es un error, contacta al administrador o vuelve al panel principal."
        />
    );
}
